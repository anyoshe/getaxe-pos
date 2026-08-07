import { Repository } from "@/repositories/base";

import {
  currencies,
} from "@/db/schema/settings/currencies";

import {
  eq,
} from "drizzle-orm";


class CurrenciesRepository {

  async findActive() {

    return Repository.db.query.currencies.findMany({

      where: eq(
        currencies.active,
        true,
      ),

      orderBy:
        currencies.name,

    });

  }


  async findByCode(
    code: string,
  ) {

    return Repository.db.query.currencies.findFirst({

      where: eq(
        currencies.code,
        code,
      ),

    });

  }

}


export const currenciesRepository =
  new CurrenciesRepository();