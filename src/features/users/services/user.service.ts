import {
    userRepository,
} from "@/repositories";

import type {
    User,
} from "../types";

import {
    hashPassword,
} from "@/lib/auth/password";


export class UserService {

    async getUsers(
    options?: {
        search?: string;
        roleId?: string;
        active?: boolean;
        page?: number;
        pageSize?: number;
    },
) {
    return userRepository.findMany(options);
}

    async getUser(
        id: string,
    ): Promise<User | null> {
        return userRepository.findById(id) as Promise<User | null>;
    }


    async createUser(
        data: Omit<
            Parameters<
                typeof userRepository.create
            >[0],
            "passwordHash"
        > & {
            password: string;
        },
    ) {

        const {
            password,
            ...userData
        } = data;


        return userRepository.create({

            ...userData,

            passwordHash:
                await hashPassword(password),

        });

    }


    async updateUser(
        id: string,
        data: Parameters<
            typeof userRepository.update
        >[1],
    ) {
        return userRepository.update(
            id,
            data,
        );
    }


    async activateUser(
        id: string,
    ) {
        return userRepository.activate(id);
    }


    async deactivateUser(
        id: string,
    ) {
        return userRepository.deactivate(id);
    }


    async deleteUser(
        id: string,
    ) {
        return userRepository.delete(id);
    }

}


export const userService =
    new UserService();