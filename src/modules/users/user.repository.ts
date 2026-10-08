import { UserModel } from "./user.model.js";
import type {
    CreateUserInput,
} from "./user.types.js";

class UserRepository {
    /** Creates a user record. */
    async create(data: CreateUserInput) {
        return UserModel.create(data);
    }

    /** Finds a user by email without selecting the password. */
    async findByEmail(email: string) {
        return UserModel.findOne({ email });
    }

    /** Finds a user by email and explicitly includes its password hash. */
    async findByEmailWithPassword(email: string) {
        return UserModel
            .findOne({ email })
            .select("+password");
    }

    /** Finds a user by ID. */
    async findById(id: string) {
        return UserModel.findById(id);
    }

    /** Records the user's latest successful login time. */
    async updateLastLogin(id: string) {
        return UserModel.findByIdAndUpdate(
            id,
            {
                lastLoginAt: new Date(),
            },
            {
                new: true,
            }
        );
    }
}

export const userRepository = new UserRepository();