export interface User {
    id?: number | string;
    _id?: string;
    name?: string;
    username?: string;
    email: string;
    role_id?: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
};
