import { Repository } from "./repository";

import type {
  Database,
  Transaction,
} from "./types";

export abstract class BaseRepository {

  constructor(
    protected readonly database:
      Database | Transaction = Repository.db
  ) {}

  /**
   * PostgreSQL numeric -> number
   */
  protected toNumber(
    value: string | null | undefined
  ): number | null {

    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    return Number(value);

  }

  /**
   * number -> PostgreSQL numeric
   */
  protected toNumeric(
    value: number | null | undefined
  ): string | null {

    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    return value.toString();

  }

}