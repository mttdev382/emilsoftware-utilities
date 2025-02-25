import { jsPDF } from "jspdf";
import autotable from "jspdf-autotable";
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Interface representing the contract parties.
 */
export interface IPartiContratto {
    fornitore: {
        denominazione: string;
        codiceFiscale: string;
        indirizzoCompleto: string;
    };
    cliente: {
        denominazione: string;
        codiceFiscale: string;
        indirizzoCompleto: string;
    };
}

/**
 * Parameters passed by the user when generating a document.
 */
export interface DocumentParams {
    parti: IPartiContratto;
    tipOutput?: 'f' | 'd' | 'u'; // f: open in a new window, d: download, u: return ArrayBuffer
    dynamicFields?: { [key: string]: string };
    dynamicElements?: { [placeholder: string]: DynamicElement };
}

/**
 * DynamicElement supports different types, currently "table".
 */
export type DynamicElement = {
    type: 'table';
    config: {
        head: string[];
        body: string[][];
        options?: any;
    };
};

/**
 * A simplified type for the configuration file.
 */
interface DocumentConfig {
    fontTitolo: { nome: string; dimensione: number; colore: string; installPath?: string; };
    fontSottotitolo: { nome: string; dimensione: number; colore: string; installPath?: string; };
    fontTesto: { nome: string; dimensione: number; colore: string; installPath?: string; };
    margini: { sx: number; dx: number; alto: number; basso: number; };
    staccoriga: number;
    rientro: number;
    testi: {
        titolo: string;
        premessa: string;
        Punti: Array<{ titolo: string; Sottopunti: Array<{ titolo: string; contenuto: string; }>; }>;
        versione: string;
    };
    immagini: Array<{ path: string; posizione: [number, number]; dimensioni: [number, number]; coeffDim?: number; }>;
    box: { backgrund: string; raggio: number; };
}

/**
 * Reads an image file from the filesystem and returns a Base64-encoded data URL.
 * @param imagePath - Path to the image file.
 * @returns The Base64-encoded data URL of the image.
 */
async function loadImageAsBase64(imagePath: string): Promise<string> {
    const absolutePath = path.resolve(imagePath);
    const buffer = await fs.readFile(absolutePath);
    const ext = path.extname(imagePath).slice(1).toLowerCase();
    const base64 = buffer.toString('base64');
    return `data:image/${ext};base64,${base64}`;
}

/**
 * DocumentGenerator encapsulates the PDF generation logic.
 * It handles text wrapping, dynamic placeholders, image insertion, custom font installation,
 * and rendering text inside a rounded rectangle box or as bold text.
 */
export class DocumentGenerator {
    private config!: DocumentConfig;
    private doc!: jsPDF;
    private curX: number = 0;
    private curY: number = 0;
    private configLoaded: boolean = false;

    /**
     * Constructor for DocumentGenerator.
     * @param configPath - Optional path to the JSON configuration file.
     */
    constructor(private configPath?: string) {}

    /**
     * Sets the configuration directly.
     * @param config - The DocumentConfig object.
     */
    public setConfig(config: DocumentConfig) {
        this.config = config;
        this.configLoaded = true;
    }

    /**
     * Applies dynamic text templating by replacing markers like $KEY$ with their values.
     * @param template - The template string containing markers.
     * @param dynamicFields - An object mapping marker keys to replacement values.
     * @returns The processed string with replacements.
     */
    private applyTemplate(template: string, dynamicFields?: { [key: string]: string }): string {
        if (!dynamicFields) return template;
        return template.replace(/\$(\w+)\$/g, (match, key) => dynamicFields[key] !== undefined ? dynamicFields[key] : match);
    }

    /**
     * Replaces party-specific placeholders (e.g., $cliente:denominazione$) with corresponding values.
     * @param text - The text containing party placeholders.
     * @param parti - The contract parties.
     * @returns The processed string with party-specific values.
     */
    private applyPartiPlaceholders(text: string, parti: IPartiContratto): string {
        return text.replace(/\$(fornitore|cliente):(\w+)\$/g, (match, party, field) => {
            return (parti[party] && (parti[party] as any)[field]) ? (parti[party] as any)[field] : match;
        });
    }

    /**
     * Loads the configuration JSON from the local filesystem.
     * @throws Error if the configuration file cannot be read.
     */
    private async loadConfig(): Promise<void> {
        if (this.configLoaded) return;
        if (!this.configPath) throw new Error("No configuration provided. Set a configPath or use setConfig().");
        try {
            const data = await fs.readFile(this.configPath, 'utf8');
            this.config = JSON.parse(data) as DocumentConfig;
            this.configLoaded = true;
        } catch (error) {
            throw new Error(`Error reading configuration file: ${error}`);
        }
    }

    /**
     * Initializes the jsPDF document and sets the cursor to the top-left margin.
     */
    private initDoc(): void {
        this.doc = new jsPDF();
        const margins = this.config.margini;
        this.curX = margins.sx;
        this.curY = margins.alto;
    }

    /**
     * Extracts a dynamic element placeholder from text if it is in the form "$PLACEHOLDER$".
     * @param text - The text to check.
     * @returns The placeholder key or null if not found.
     */
    private extractPlaceholder(text: string): string | null {
        const match = text.match(/^\$(\w+)\$$/);
        return match ? match[1] : null;
    }

    /**
     * Installs a custom font into jsPDF by reading the font file and adding it to the Virtual File System.
     * @param fontPath - Path to the TTF font file.
     * @param fontName - Name of the font to be used in jsPDF.
     */
    private async installFont(fontPath: string, fontName: string): Promise<void> {
        const absolutePath = path.resolve(fontPath);
        const buffer = await fs.readFile(absolutePath);
        const base64Font = buffer.toString('base64');
        console.log(`Installing font ${fontName} from ${absolutePath}`);
        this.doc.addFileToVFS(`${fontName}.ttf`, base64Font);
        this.doc.addFont(`${fontName}.ttf`, fontName, 'normal');
        this.doc.setFont(fontName);
    }

    /**
     * Core method to write wrapped text with a specified font.
     * Handles text splitting and page-breaks.
     * @param fontName - The name of the font to use.
     * @param fontSize - The font size in points.
     * @param color - The text color.
     * @param text - The text to write.
     * @param x - The X coordinate.
     * @param y - The starting Y coordinate.
     * @param maxWidth - Maximum width for text wrapping.
     * @param lineSpacingFactor - Factor for line spacing.
     * @returns The updated Y position after writing the text.
     */
    private async writeWrappedTextCore(
        fontName: string,
        fontSize: number,
        color: string,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        lineSpacingFactor: number = 1.15
    ): Promise<number> {
        this.doc.setFont(fontName);
        this.doc.setFontSize(fontSize);
        this.doc.setTextColor(color);
        const lines = this.doc.splitTextToSize(text, maxWidth);
        const lineHeight = (fontSize * lineSpacingFactor / 72) * 25.4;
        for (const line of lines) {
            if (y + lineHeight > (this.doc.internal.pageSize.getHeight() - this.config.margini.basso)) {
                this.doc.addPage();
                y = this.config.margini.alto;
            }
            this.doc.text(line, x, y);
            y += lineHeight;
        }
        return y;
    }

    /**
     * Writes wrapped text using a custom font.
     * Ensures the font is installed before writing.
     * @param fontConf - Font configuration object.
     * @param text - The text to write.
     * @param x - The X coordinate.
     * @param y - The starting Y coordinate.
     * @param maxWidth - Maximum width for text wrapping.
     * @param lineSpacingFactor - Factor for line spacing.
     */
    private async writeWrappedTextWithFont(
        fontConf: { nome: string; dimensione: number; colore: string; installPath?: string },
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        lineSpacingFactor: number = 1.15
    ): Promise<void> {
        const fontList = this.doc.getFontList();
        if (!fontList[fontConf.nome]) {
            if (fontConf.installPath) await this.installFont(fontConf.installPath, fontConf.nome);
            else throw new Error("Font not present and no installPath provided");
        } else {
            this.doc.setFont(fontConf.nome);
        }
        this.curY = await this.writeWrappedTextCore(fontConf.nome, fontConf.dimensione, fontConf.colore, text, x, y, maxWidth, lineSpacingFactor);
    }

    /**
     * Renders text inside a rounded rectangle box.
     * This method is invoked when text is wrapped in '^' markers.
     * @param text - The text to render (without '^' markers).
     * @param fontConf - Font configuration for the text.
     * @param padding - Padding inside the box.
     * @param borderRadius - Corner radius of the box.
     * @param borderWidth - Border thickness.
     * @param boxColor - Optional background color.
     */
    public async scriveTestoBox(
        text: string,
        fontConf: { nome: string; dimensione: number; colore: string; installPath?: string },
        padding: number = 5,
        borderRadius: number = 5,
        borderWidth: number = 1,
        boxColor?: string
    ): Promise<void> {
        const fontList = this.doc.getFontList();
        if (!fontList[fontConf.nome]) {
            if (fontConf.installPath) await this.installFont(fontConf.installPath, fontConf.nome);
            else throw new Error("Font not present and no installPath provided");
        } else {
            this.doc.setFont(fontConf.nome);
        }
        this.doc.setFontSize(fontConf.dimensione);
        this.doc.setTextColor(fontConf.colore);
        const pageWidth = this.doc.internal.pageSize.getWidth();
        const maxTextWidth = pageWidth - this.config.margini.sx - this.config.margini.dx - 2 * padding;
        const lines = this.doc.splitTextToSize(text, maxTextWidth);
        const lineHeight = (fontConf.dimensione * 1.15 / 72) * 25.4;
        const textHeight = lines.length * lineHeight;
        const boxX = this.curX;
        const boxY = this.curY;
        const boxWidth = maxTextWidth + 2 * padding;
        const boxHeight = textHeight + 2 * padding;
        if (boxColor) {
            this.doc.setFillColor(boxColor);
            this.doc.roundedRect(boxX, boxY, boxWidth, boxHeight, borderRadius, borderRadius, 'F');
        }
        this.doc.setLineWidth(borderWidth);
        this.doc.roundedRect(boxX, boxY, boxWidth, boxHeight, borderRadius, borderRadius);
        const textX = boxX + padding;
        let textY = boxY + padding + lineHeight;
        for (const line of lines) {
            this.doc.text(line, textX, textY);
            textY += lineHeight;
        }
        this.curY = boxY + boxHeight + this.config.staccoriga;
    }

    /**
     * Checks if a given text is wrapped in '^' markers, indicating it should be rendered in a box.
     * @param text - The text to check.
     * @returns True if text is boxed.
     */
    private isBoxedText(text: string): boolean {
        return text.startsWith('^') && text.endsWith('^');
    }

    /**
     * Removes the '^' markers from the text.
     * @param text - The boxed text.
     * @returns The text without '^' markers.
     */
    private stripBoxMarkers(text: string): string {
        return text.substring(1, text.length - 1);
    }

    /**
     * Checks if a given text is wrapped in '**' markers, indicating bold formatting.
     * @param text - The text to check.
     * @returns True if text is marked as bold.
     */
    private isBoldText(text: string): boolean {
        return text.startsWith('**') && text.endsWith('**');
    }

    /**
     * Removes the '**' markers from bold text.
     * @param text - The bold text.
     * @returns The text without '**' markers.
     */
    private stripBoldMarkers(text: string): string {
        return text.substring(2, text.length - 2);
    }

    /**
     * Inserts images as defined in the configuration.
     * Uses the current cursor position for placement.
     */
    private async inserisciImmagini(): Promise<void> {
        if (this.config.immagini && this.config.immagini.length > 0) {
            const startX = this.curX;
            for (const imgConf of this.config.immagini) {
                const format = imgConf.path.split('.').pop()?.toUpperCase() || 'PNG';
                const base64Image = await loadImageAsBase64(imgConf.path);
                const startY = this.curY;
                if (startY + imgConf.dimensioni[1] > (this.doc.internal.pageSize.getHeight() - this.config.margini.basso)) {
                    this.doc.addPage();
                    this.curY = this.config.margini.alto;
                }
                this.doc.addImage(base64Image, format, startX, this.curY, imgConf.dimensioni[0], imgConf.dimensioni[1]);
                console.log(`Image inserted at X: ${startX}, Y: ${this.curY}`);
                this.curY = this.curY + imgConf.dimensioni[1] + this.config.staccoriga;
            }
        }
    }

    /**
     * Generates the PDF document based on provided parameters.
     * Processes dynamic fields, images, tables, and text (with optional boxed or bold formatting).
     * Returns the file name if saved or an ArrayBuffer.
     * @param params - The DocumentParams object.
     */
    public async generateDocument(params: DocumentParams): Promise<string | ArrayBuffer> {
        await this.loadConfig();
        this.initDoc();

        await this.inserisciImmagini();
        const dynamicFields = params.dynamicFields || {};
        const dynamicElements = params.dynamicElements || {};
        const pageWidth = this.doc.internal.pageSize.getWidth();
        const maxWidth = pageWidth - (this.config.margini.sx + this.config.margini.dx);

        let titolo = this.applyTemplate(this.config.testi.titolo, dynamicFields);
        titolo = this.applyPartiPlaceholders(titolo, params.parti);
        await this.writeWrappedTextWithFont(this.config.fontTitolo, titolo, this.curX, this.curY, maxWidth);
        this.curY += this.config.staccoriga;

        let premessa = this.applyTemplate(this.config.testi.premessa, dynamicFields);
        premessa = this.applyPartiPlaceholders(premessa, params.parti);
        await this.writeWrappedTextWithFont(this.config.fontTesto, premessa, this.curX, this.curY, maxWidth);
        this.curY += this.config.staccoriga;

        for (const punto of this.config.testi.Punti) {
            let puntoTitolo = this.applyTemplate(punto.titolo, dynamicFields);
            puntoTitolo = this.applyPartiPlaceholders(puntoTitolo, params.parti);
            await this.writeWrappedTextWithFont(this.config.fontTitolo, puntoTitolo, this.curX, this.curY, maxWidth);
            this.curY += this.config.staccoriga;
            for (const sub of punto.Sottopunti) {
                const placeholder = this.extractPlaceholder(sub.titolo);
                if (placeholder && dynamicElements[placeholder] && dynamicElements[placeholder].type === 'table') {
                    const tableConfig = dynamicElements[placeholder].config;
                    autotable(this.doc, { startY: this.curY, head: [tableConfig.head], body: tableConfig.body, ...tableConfig.options });
                    this.curY = (this.doc as any).lastAutoTable.finalY + this.config.staccoriga;
                } else {
                    if (sub.titolo) {
                        let titleText = this.applyTemplate(sub.titolo, dynamicFields);
                        titleText = this.applyPartiPlaceholders(titleText, params.parti);
                        if (this.isBoxedText(titleText)) {
                            const boxText = this.stripBoxMarkers(titleText);
                            await this.scriveTestoBox(boxText, this.config.fontSottotitolo);
                        } else if (this.isBoldText(titleText)) {
                            const boldText = this.stripBoldMarkers(titleText);
                            await this.writeWrappedTextWithFont({ ...this.config.fontSottotitolo, nome: "Montserrat-Bold" }, boldText, this.curX + this.config.rientro, this.curY, maxWidth - this.config.rientro);
                        } else {
                            await this.writeWrappedTextWithFont(this.config.fontSottotitolo, titleText, this.curX + this.config.rientro, this.curY, maxWidth - this.config.rientro);
                        }
                        this.curY += this.config.staccoriga;
                    }
                }
                const contentPlaceholder = this.extractPlaceholder(sub.contenuto);
                if (contentPlaceholder && dynamicElements[contentPlaceholder] && dynamicElements[contentPlaceholder].type === 'table') {
                    const tableConfig = dynamicElements[contentPlaceholder].config;
                    autotable(this.doc, { startY: this.curY, head: [tableConfig.head], body: tableConfig.body, ...tableConfig.options });
                    this.curY = (this.doc as any).lastAutoTable.finalY + this.config.staccoriga;
                } else if (sub.contenuto) {
                    let contenuto = this.applyTemplate(sub.contenuto, dynamicFields);
                    contenuto = this.applyPartiPlaceholders(contenuto, params.parti);
                    if (this.isBoxedText(contenuto)) {
                        const boxText = this.stripBoxMarkers(contenuto);
                        await this.scriveTestoBox(boxText, this.config.fontTesto);
                    } else if (this.isBoldText(contenuto)) {
                        const boldText = this.stripBoldMarkers(contenuto);
                        await this.writeWrappedTextWithFont({ ...this.config.fontTesto, nome: "Montserrat-Bold" }, boldText, this.curX + this.config.rientro, this.curY, maxWidth - this.config.rientro);
                    } else {
                        await this.writeWrappedTextWithFont(this.config.fontTesto, contenuto, this.curX + this.config.rientro, this.curY, maxWidth - this.config.rientro);
                    }
                    this.curY += this.config.staccoriga;
                }
            }
            this.curY += this.config.staccoriga;
        }
        const tipOutput = params.tipOutput || 'd';
        const fileName = `Documento_${params.parti.cliente.denominazione}.pdf`;
        if (tipOutput === 'd') {
            const pdfBuffer = this.doc.output('arraybuffer');
            await fs.writeFile(fileName, Buffer.from(pdfBuffer));
            return fileName;
        } else if (tipOutput === 'u') {
            return this.doc.output('arraybuffer');
        } else {
            return this.doc.output('arraybuffer');
        }
    }
}