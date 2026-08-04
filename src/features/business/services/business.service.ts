import {
  businessRepository,
} from "@/repositories";

export class BusinessService {

  async getBusinesses() {
    return businessRepository.findAll();
  }

  async getBusiness(
    id: string,
  ) {
    return businessRepository.findById(id);
  }

  async createBusiness(
    data: Parameters<
      typeof businessRepository.create
    >[0],
  ) {
    return businessRepository.create(data);
  }

  async updateBusiness(
    id: string,
    data: Parameters<
      typeof businessRepository.update
    >[1],
  ) {
    return businessRepository.update(
      id,
      data,
    );
  }

  async activateBusiness(
    id: string,
  ) {
    return businessRepository.activate(id);
  }

  async deactivateBusiness(
    id: string,
  ) {
    return businessRepository.deactivate(id);
  }

  async deleteBusiness(
    id: string,
  ) {
    return businessRepository.delete(id);
  }

}

export const businessService =
  new BusinessService();