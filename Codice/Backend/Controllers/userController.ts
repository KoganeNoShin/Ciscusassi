import UserService from '../Services/userService';

class UserController
{
    static async register(req, res) {
        return UserService.register();
    }

    static async login(req, res) {
        return UserService.login();
    }
}

export default UserController;