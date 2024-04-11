import User from "App/Models/User";
import _ from 'lodash'
import hash from "Config/hash";



export default class UserService {
   static async getUserAll(){
    const user = await User.all
    return user
   }
   static async createUser(data: any) {
    const user = await User.create(data)
    return user
  }

   static async updateUser(id: number, userData: any) {
    try {
      // ค้นหาผู้ใช้โดยใช้ id
      const user = await User.findOrFail(id)
      
      // อัปเดตข้อมูลผู้ใช้
      user.merge(userData)
      
      // บันทึกการเปลี่ยนแปลงลงในฐานข้อมูล
      await user.save()
    } catch (error) {
      throw new Error('Failed to update user')
    }
  }

  static async delete(id: any) {
    const item = await User.findOrFail(id)
    return await item.delete()
  }
}
