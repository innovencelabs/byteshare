import conf from '@/conf/config'
import { Client, Account, ID } from 'appwrite'

type CreateUserAccount = {
  name: string
  email: string
  password: string
}

type LoginUserAccount = {
  email: string
  password: string
}

type ForgotPassword = {
  email: string
}

type CompleteForgotPassword = {
  userId: string
  secret: string
  password: string
  confirmPassword: string
}

type CompleteVerification = {
  userId: string
  secret: string
}

type SignInWithGoogle = {
  successRedirect: string
  failureRedirect: string
}

const appwriteClient = new Client()
appwriteClient.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectID)

export const account = new Account(appwriteClient)

export class AppwriteService {
  async createUserAccount({ name, email, password }: CreateUserAccount) {
    try {
      const userAccount = await account.create(
        ID.unique(),
        email,
        password,
        name,
      )
      if (userAccount) {
        return this.login({ email, password })
      } else {
        return userAccount
      }
    } catch (err: any) {
      throw err
    }
  }

  async login({ email, password }: LoginUserAccount) {
    try {
      return await account.createEmailSession(email, password)
    } catch (err: any) {
      throw err
    }
  }

  async loginWithGoogle({
    successRedirect,
    failureRedirect,
  }: SignInWithGoogle) {
    try {
      account.createOAuth2Session('google', successRedirect, failureRedirect)
    } catch (err: any) {
      throw err
    }
  }

  async initiateVerification() {
    try {
      const verifyEmailURL: string =
        process.env.NEXT_PUBLIC_APP_URL + '/auth/verify-email'
      return await account.createVerification(verifyEmailURL)
    } catch (err: any) {
      throw err
    }
  }

  async completeVerification({ userId, secret }: CompleteVerification) {
    try {
      return await account.updateVerification(userId, secret)
    } catch (err: any) {
      throw err
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const data = await this.getCurrentUser()
      return Boolean(data)
    } catch (err: any) {}

    return false
  }

  async getCurrentUser() {
    try {
      return account.get()
    } catch (err: any) {
      console.log('GetCurrentUser Error: ' + err)
    }

    return null
  }

  async initiateForgotPassword({ email }: ForgotPassword) {
    try {
      const resetPasswordURL: string =
        process.env.NEXT_PUBLIC_APP_URL + '/auth/reset-password'
      return await account.createRecovery(email, resetPasswordURL)
    } catch (err: any) {
      throw err
    }
  }

  // TODO: make it to self login
  async completeForgotPassword({
    userId,
    secret,
    password,
    confirmPassword,
  }: CompleteForgotPassword) {
    try {
      return await account.updateRecovery(
        userId,
        secret,
        password,
        confirmPassword,
      )
    } catch (err: any) {
      throw err
    }
  }

  async logout() {
    try {
      return await account.deleteSession('current')
    } catch (err: any) {
      console.log('Logout Error: ' + err)
    }
  }
}

const appwriteService = new AppwriteService()

export default appwriteService
