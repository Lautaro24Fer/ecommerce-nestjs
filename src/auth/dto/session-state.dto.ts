export class SessionStateDto{
    constructor(){
        this.isLogged = false;
        this.refreshTokenExists = false;
        this.message = ''
        this.payload = null;
    }
    isLogged: boolean;
    refreshTokenExists: boolean;
    message: string;
    payload?: any;
}

export interface IAuthTokens {
    token: string;
    refreshToken: string;
}