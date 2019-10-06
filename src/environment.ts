export class Environment {

    public static getVersion(): string {
        return '/api/v1';
    }

    // khi deloy thay bằng 'production'
    public static getENV() {
        return (process.env.NODE_ENV) || 'development';
    }

    public static getPort(): number {
        return (process.env.PORT as any) || 3000;
    }

    public static getJWTSecret(): string {
        return '@Tab@llen';
    }

    public static getTokenHeaderKey(): string {
        return 'X-token';
    }
}