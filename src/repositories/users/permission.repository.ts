import {
    eq,
} from "drizzle-orm";

import {
    Repository,
} from "../base/repository";

import {
    permissions,
} from "@/db/schema/users/permissions";


export class PermissionRepository {

    async findAll() {
        return Repository.db.query.permissions.findMany({
            orderBy: (permissions, { asc }) => [
                asc(permissions.module),
                asc(permissions.code),
            ],
        });
    }


    async findById(
        id: string,
    ) {
        return Repository.db.query.permissions.findFirst({
            where: eq(
                permissions.id,
                id,
            ),
        });
    }


    async findByCode(
        code: string,
    ) {
        return Repository.db.query.permissions.findFirst({
            where: eq(
                permissions.code,
                code,
            ),
        });
    }


    async exists(
        id: string,
    ) {
        const permission =
            await Repository.db.query.permissions.findFirst({
                where: eq(
                    permissions.id,
                    id,
                ),

                columns: {
                    id: true,
                },
            });

        return !!permission;
    }


    async upsert(
        data: {
            code: string;
            module: string;
            name: string;
            description: string | null;
        },
    ) {

        const existing =
            await this.findByCode(
                data.code,
            );


        if (existing) {

            const [updated] =
                await Repository.db
                    .update(permissions)
                    .set({
                        module: data.module,
                        name: data.name,
                        description: data.description,
                        active: true,
                    })
                    .where(
                        eq(
                            permissions.id,
                            existing.id,
                        ),
                    )
                    .returning();

            return updated;
        }


        const [inserted] =
            await Repository.db
                .insert(permissions)
                .values({
                    code: data.code,
                    module: data.module,
                    name: data.name,
                    description: data.description,
                    active: true,
                    isSystem: true,
                })
                .returning();

        return inserted;
    }


    async activate(
        id: string,
    ) {
        const [permission] =
            await Repository.db
                .update(permissions)
                .set({
                    active: true,
                })
                .where(
                    eq(
                        permissions.id,
                        id,
                    ),
                )
                .returning();

        return permission;
    }


    async deactivate(
        id: string,
    ) {
        const [permission] =
            await Repository.db
                .update(permissions)
                .set({
                    active: false,
                })
                .where(
                    eq(
                        permissions.id,
                        id,
                    ),
                )
                .returning();

        return permission;
    }


    async delete(
        id: string,
    ) {
        await Repository.db
            .delete(permissions)
            .where(
                eq(
                    permissions.id,
                    id,
                ),
            );
    }

}


export const permissionRepository =
    new PermissionRepository();