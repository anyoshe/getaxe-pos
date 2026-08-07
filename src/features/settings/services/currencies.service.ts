import {
  currenciesRepository,
} from "@/repositories/settings/currencies.repository";


class CurrenciesService {

  async getActiveCurrencies() {

    return currenciesRepository.findActive();

  }

}


export const currenciesService =
  new CurrenciesService();