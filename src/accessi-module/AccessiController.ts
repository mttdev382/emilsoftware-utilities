import { Logger } from "../Logger";
import { RestUtilities } from "../Utilities";
import { AccessiModel } from "./AccessiModel";
import { Response, Request } from "express";
import { LoginRequest } from "./models/DTO/LoginRequest";
import jwt from "jsonwebtoken";
import { JwtOptions } from "./models/JwtOptions";
import { autobind } from "../autobind";

@autobind
export class AccessiController {
    private logger: Logger = new Logger(AccessiController.name);


    constructor(private accessiModel: AccessiModel, private jwtOptions: JwtOptions) { }

    public async login(req: Request, res: Response) {
        try {
            let request = req.body as LoginRequest;
            const userData = await this.accessiModel.login(request);

            if (!userData) return RestUtilities.sendErrorMessage(res, "Credenziali errate", AccessiController.name);

            const token = jwt.sign({ userData }, this.jwtOptions.secret, { expiresIn: this.jwtOptions.expiresIn });

            return RestUtilities.sendBaseResponse(res, token)
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

}