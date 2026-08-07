import {
  countriesRepository,
} from "@/repositories/settings/countries.repository";


class CountriesService {

  async getActiveCountries() {

    return countriesRepository.findActive();

  }

}


export const countriesService =
  new CountriesService();