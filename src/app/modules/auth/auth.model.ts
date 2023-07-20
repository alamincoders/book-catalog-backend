import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../../../config';
import { IUser, ReadingStatus, UserModel } from './auth.interface';

const userSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
    wishlist: [
      {
        _id: false,
        bookID: {
          type: Schema.Types.ObjectId,
          ref: 'Book',
        },
        bookName: {
          type: String,
        },
      },
    ],
    readingList: [
      {
        _id: false,
        book: {
          type: Schema.Types.ObjectId,
          ref: 'Book',
        },
        bookName: {
          type: String,
        },
        status: {
          type: String,
          enum: Object.values(ReadingStatus),
          default: ReadingStatus.ToRead,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
  },
});

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bycrypt_salt_rounds),
  );
  next();
});

userSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword);
};

userSchema.statics.isUserExist = async function (email: string) {
  return await this.findOne({ email }).select('_id email name');
};

export const User = model<IUser, UserModel>('User', userSchema);
