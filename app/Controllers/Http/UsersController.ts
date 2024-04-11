import User from 'App/Models/User'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserService from 'App/Services/UserService'
import UserRole from 'App/Models/enum'
import Hash from '@ioc:Adonis/Core/Hash'


export default class UsersController {
    async index({ response}: HttpContextContract) {
        return response.redirect().toRoute('/loginPage')
      }

    async register({ request, response }: HttpContextContract) {
        try {
          const userData = request.only(['email', 'password', 'fullName'])
          const user = await UserService.createUser(userData)
          console.log(user)
          return response.redirect('back')
        } catch (error) {
          console.error(error)
          return response.status(500).json({ error: 'Failed to create user' })
        }
      }

      public async registerPage({ view }: HttpContextContract){
        return view.render('pages/register')
    }

    
    public async loginPage({ view }: HttpContextContract){
        return view.render('pages/login')
    }

    public async shopPage({ view }: HttpContextContract){
        return view.render('pages/welcome')
    }

    public async login ({ auth, request, response }: HttpContextContract) {
        try {
          const email = request.input('email')
          const password = request.input('password')
          
          // Attempt to find the user by email
          const user = await User.query()
            .where('email', email)
            .firstOrFail()
      
          // Verify password
          if (!(await Hash.verify(user.password, password))) {
            return response.badRequest('Invalid credentials')
          }
          
          // Create session
          await auth.use('web').login(user)
      
          // Check if user is admin
          if (user.role === UserRole.Admin) {
            return response.redirect('/adminPage') // หากเป็น admin ให้เข้าไปยังหน้า admin
          } else if (user.role === UserRole.Member){
            return response.redirect('/shopPage') // หากไม่ใช่ admin ให้เข้าไปยังหน้า shopPage
          }else{
            return response.redirect('/shopPage')
          }
        } catch (error) {
          // Catch the exception if no user is found or password is incorrect
          if (error.code === 'E_ROW_NOT_FOUND' || error.code === 'E_INVALID_AUTH_PASSWORD') {
            return response.badRequest('Invalid credentials')
          }
          
          // Handle other errors
          console.error(error)
          return response.internalServerError('An unexpected error occurred')
        }
      }
      

    public async logout({ auth, response }: HttpContextContract){
        await auth.use('web').logout()
        response.redirect('/loginPage')
    }

    public async adminPage({ view }: HttpContextContract){
        const users = await User.all()
        return view.render('admin',{users})
    }

    async editUser({ params, view }: HttpContextContract) {
        const user = await User.find(params.id)
        return view.render('updateUser', { user })
      }

    async updateUser({ params, request, response }: HttpContextContract) {
        try {
          const { id } = params
          const userData = request.only(['email', 'password', 'fullName'])
          
          await UserService.updateUser(id, userData)
          
          return response.redirect('/adminPage')
        } catch (error) {
          // หากเกิดข้อผิดพลาด ส่งคำตอบกลับด้วยข้อความข้อผิดพลาด
          return response.badRequest(error.message)
        }
      }

    async deleteUser({ response, params }: HttpContextContract) {
        await UserService.delete(params.id)
        return response.redirect('back')
      }

    }
