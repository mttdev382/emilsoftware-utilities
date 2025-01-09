import { Orm } from "./Orm";
import { Logger } from "./Logger";
import { Options } from "es-node-firebird";

export abstract class DatabaseUpdater {
  //#region Fields and Options
  protected static options: Options;
  protected static logger: Logger = new Logger(DatabaseUpdater.name);
  //#endregion

  //#region Utility Methods
  /**
   * Checks if a column exists in a specific table.
   * @param options Database connection options.
   * @param table Table name.
   * @param column Column name.
   * @returns True if the column exists, false otherwise.
   */
  protected static async columnExists(
    options: Options,
    table: string,
    column: string
  ): Promise<boolean> {

    try {
      const query = `
      SELECT 1 
      FROM RDB$RELATION_FIELDS 
      WHERE RDB$RELATION_NAME = ? 
        AND RDB$FIELD_NAME = ?`;
      const result = await Orm.query(options, query, [
        table.toUpperCase(),
        column.toUpperCase(),
      ]);
      return result.length > 0;
    } catch (error: any) {
      this.logger.error(`Error checking column ${column} on table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves the current database version from the PARAMETRI table.
   * @param options Database connection options.
   * @returns The current database version or null if not found.
   */
  protected static async getDatabaseVersion(options: Options): Promise<string | null> {

    try {
      const parameters = (await Orm.query(
        options,
        "SELECT CODPAR, DESPAR FROM PARAMETRI WHERE CODPAR = ?",
        ["VersioneDB"]
      )) as any[];

      return parameters.length > 0 ? parameters[0].DESPAR : null;
    } catch (error: any) {
      this.logger.error(`Error getting database version:`, error);
      throw error;
    }
  }

  /**
   * Updates the database version in the PARAMETRI table.
   * @param options Database connection options.
   * @param version The new database version.
   */
  protected static async setDatabaseVersion(
    options: Options,
    version: string
  ): Promise<void> {

    try {

      await Orm.query(options, "UPDATE PARAMETRI SET DESPAR = ? WHERE CODPAR = ?", [
        version,
        "VersioneDB",
      ]);
    } catch (error: any) {
      this.logger.error(`Error setting database version:`, error);
      throw error;
    }
  }
  //#endregion

  //#region Initialization Methods
  /**
   * Ensures the PARAMETRI table exists and initializes it if necessary.
   * @param options Database connection options.
   */
  protected static async createParametersTable(options: Options): Promise<void> {
    try {
      const columnAlreadyExists = await this.columnExists(options, "PARAMETRI", "CODPAR");
      if (columnAlreadyExists) return;

      const createTableQuery = `
        CREATE TABLE PARAMETRI (
          CODPAR  VARCHAR(15) NOT NULL,
          DESPAR  VARCHAR(255),
          NOTE    BLOB SUB_TYPE 1 SEGMENT SIZE 80,
          GRUPPO  VARCHAR(20)
        );`;

      await Orm.query(options, createTableQuery);

      await Orm.query(
        options,
        "ALTER TABLE PARAMETRI ADD CONSTRAINT PK_PARAMETRI PRIMARY KEY (CODPAR);"
      );

      await Orm.query(options, "GRANT ALL ON PARAMETRI TO PUBLIC;");
      await Orm.query(options, "GRANT SELECT ON PARAMETRI TO TABX;");

      const versioneDb = await this.getDatabaseVersion(options);
      if (versioneDb !== null && versioneDb !== undefined) return;

      await Orm.query(
        options,
        "INSERT INTO PARAMETRI (CODPAR, DESPAR, NOTE, GRUPPO) VALUES (?,?,?,?)",
        ["VersioneDB", "0.0a", "versione", null]
      );
    } catch (error: any) {
      this.logger.error("Error creating table PARAMETRI:", error);
      throw error;
    }


  }
  //#endregion
}
