export interface DamageType {
    id: string;
    name: string;
    description?: string;
}

export interface DamageTypeCreate {
    name: string;
    description?: string;
}

export interface DamageTypeUpdate {
    name: string;
    description?: string;
}
