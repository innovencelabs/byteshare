import conf from '@/conf/config'
import { Client, Account, ID } from 'appwrite'

type InitiateMagicURLLogin = {
  email: string
}

type CompleteMagicURLLogin = {
  userId: string
  secret: string
}

const appwriteClient = new Client()
appwriteClient.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectID)

export const account = new Account(appwriteClient)

export class AppwriteService {
  async initiateMagicURLAuthentication({ email }: InitiateMagicURLLogin) {
    try {
      const initiateMagicURL: string =
        process.env.NEXT_PUBLIC_APP_URL + '/auth/verify'
      return await account.createMagicURLSession(
        ID.unique(),
        email,
        initiateMagicURL,
      )
    } catch (err) {
      throw err
    }
  }

  async completeMagicURLAuthentication({
    userId,
    secret,
  }: CompleteMagicURLLogin) {
    try {
      return await account.updateMagicURLSession(userId, secret)
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
