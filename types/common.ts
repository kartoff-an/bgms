export interface Pageable {
    page?: number;
    size?: number;
    sort?: string;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    empty: boolean;
    first: true;
    last: true;
}
