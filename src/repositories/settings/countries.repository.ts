import { Repository } from "@/repositories/base";

import {
  countries,
} from "@/db/schema/settings/countries";

import {
  eq,
} from "drizzle-orm";


class CountriesRepository {


  async findActive() {

    return Repository.db.query.countries.findMany({

      where: eq(
        countries.active,
        true,
      ),

      orderBy:
        countries.name,

    });

  }


}


export const countriesRepository =
  new CountriesRepository();