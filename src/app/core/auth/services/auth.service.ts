import { Injectable, UnauthorizedException } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { User } from '../../user/model/entities/user.entity';
import { LoginDTO } from '../model/LoginDTO';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UserDTO } from '../../user/model/dto/UserDTO';
import { MyProject } from '../../user/model/dto/my_project.interface';
import { LoginResponse } from '../model/LoginResponse';
import { DashBoardResponse } from '../../../dashboard/model/DashBoardResponse';
import { UserTeam } from '../../user/model/entities/user_team.entity';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { IADCenterService } from '../../../ad-center/services/ad-center.interface';
import { IAuthService } from './auth.service.interface';
import { IUserService } from '../../user/services/user.service.interface';
import { IUserTeamService } from '../../user/services/user-team.service.interface';
import { IUserPrivilegeService } from '../../user/services/user-privilege.service.inteface';
import { ChangePasswordDTO } from '../model/ChangePasswordDTO';
import { IUserSessionDetailsService } from '../../user/services/user-session-details.service.interface';
import { UserTeamDTO } from '../../../teams/model/dto/UserTeamDTO';
import { ITeamService } from '../../../teams/services/team.service.interface';
import { IGlobalTeamsService } from '../../../teams/services/global.team.service.interface';
import { HomeResponse } from '../model/HomeResponse';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('IADCenterService') private readonly adCenterServiceInterface: IADCenterService,
    @Inject('IUserService') private readonly userService: IUserService,
    @Inject('IUserTeamService') private readonly userTeamService: IUserTeamService,
    @Inject('IUserSessionDetailsService') private readonly userSessionDetailsService: IUserSessionDetailsService,
    @Inject('ITeamService') private readonly teamService: ITeamService,
    @Inject('IGlobalTeamService') private readonly globalTeamsService: IGlobalTeamsService,
    private readonly jwtService: JwtService,
    @Inject('IUserPrivilegeService') private readonly userPrivilegeService: IUserPrivilegeService,
  ) {}
  globalLink = process.env.AWS_URL + 'logo';
  dash: DashBoardResponse = {} as DashBoardResponse;

  /**
   * validateUser method will validate User
   */
  async validateUser(username: string, pass: string): Promise<User | undefined> {
    const user = (await this.userService.findUser(username)) as User;
    if (user && (await compare(pass, user.password))) {
      return classToPlain(user) as User;
    }
    return undefined;
  }

  /**
   * signIn method will generate accessToken
   */
  async signIn(username: string, password: string): Promise<string> {
    const user: any = { username, password };
    return this.jwtService.sign(user, { expiresIn: '1h' });
  }

  /**
   * This method takes a dummy user name (guest) and passowrd (guest) from front end and logs in the guest user and returns
   * the corresponding login response for guest
   */
  async loginGuest(user: LoginDTO): Promise<any> {
    const accessToken = await this.signIn(user.username, user.password);
    return this.loginResponseForGuest(accessToken);
  }

  /**
   * login method response is dynamic  , it will return LoginResponse. The method first validates
   * the user, gets access token and session details and then send the whole response for landing page after sucecessful login
   */
  async login(user: LoginDTO): Promise<any> {
    let isPassword: boolean = false;
    const payload = await this.validateUser(user.username, user.password);
    if (payload) {
      const accessToken = await this.signIn(user.username, user.password);
      const userSession = await this.userSessionDetailsService.getUserSessionDetails(payload.id);
      if (userSession) {
        isPassword = userSession.isPasswordChanged;
      }
      let visitedTeam: string = '';
      let loginResponse: LoginResponse = {} as LoginResponse;
      loginResponse.userId = payload.id;
      loginResponse.isPasswordChanged = isPassword;
      if (userSession.lastCheckedInProjectId != null) {
        visitedTeam = userSession.lastCheckedInProjectId;
        loginResponse.powerboardResponse = await this.getPowerboard(visitedTeam, payload.id);
      } else {
        loginResponse.homeResponse = await this.getHomeDetailsForUserId(payload.id);
        console.log('This is login home response');
        console.log(loginResponse.homeResponse);
      }
      loginResponse.privileges = await this.getPrivileges(payload.id);
      return { loginResponse, accessToken };
    } else {
      throw new UnauthorizedException('Wrong username or password, Please try again');
    }
  }

  register(user: UserDTO): Promise<User> {
    return this.userService.registerUser(user);
  }

  /**
   * This method changes the login password for a particular user
   */
  async changePassword(changePassword: ChangePasswordDTO): Promise<any> {
    return this.userService.changePassword(changePassword);
  }

  /**
   * This method returns all the informations related to the last visited team by the user
   */
  async getPowerboard(visitedTeam: string, userId: string) {
    let userTeamDTO: UserTeamDTO = {} as UserTeamDTO;
    userTeamDTO.userId = userId;
    userTeamDTO.teamId = visitedTeam;
    if (visitedTeam == '') {
      return undefined;
    } else {
      return this.teamService.getTeamInfoById(userTeamDTO);
    }
  }

  /**
   * This method fetch ADCenter list along with teams associated with first center in
   * ADCenter list.
   */
  async loginResponseForGuest(accessToken: string) {
    let homeResponse: HomeResponse = {} as HomeResponse;
    homeResponse.My_Team = [];
    homeResponse.ADC_List = await this.adCenterServiceInterface.getAllCenters();
    homeResponse.Teams_In_ADC = await this.globalTeamsService.getTeamsByCenterId(homeResponse.ADC_List[0].centerId);
    return { homeResponse, accessToken };
  }

  /**
   * This method will check whether the user is system admin or team Member/Admin
   * and call the respective method to fetch & return an object of
   * HomeResponse according to user type.
   */

  async getHomeDetailsForUserId(userId: string): Promise<HomeResponse | undefined> {
    const userTeam = await this.userTeamService.findUserTeamsByUserId(userId);
    console.log(userTeam);
    if (userTeam[0].team == null) {
      return this.systemAdminHome();
    } else {
      return this.teamMemberTeamAdminHome(userTeam);
    }
  }

  /**
   * This method fetch ADCenter list along with teams associated with first center in
   * ADCenter list for system admin.
   * and will return an HomeResponse object.
   */
  async systemAdminHome(): Promise<any> {
    let homeResponse: HomeResponse = {} as HomeResponse;
    homeResponse.My_Center = undefined;
    homeResponse.My_Team = [];
    homeResponse.ADC_List = await this.adCenterServiceInterface.getAllCenters();

    homeResponse.Teams_In_ADC = await this.globalTeamsService.getTeamsByCenterId(homeResponse.ADC_List[0].centerId);
    return homeResponse;
  }

  /**
   * This method will fetch details of each team in UserTeam object,
   * create an array of MyProjects,
   * and call homeDetailsForTeamMemberAdmin Method for fetching and Returning an object of
   * HomeResponse.
   */
  async teamMemberTeamAdminHome(userTeam: UserTeam[]): Promise<any> {
    let teamsDTOArray = [],
      i;
    if (userTeam.length >= 1) {
      let teamsWithinUser: MyProject = {} as MyProject;
      for (i = 0; i < userTeam.length; i++) {
        teamsWithinUser.teamId = userTeam[i].team.id;
        teamsWithinUser.teamName = userTeam[i].team.name;
        teamsWithinUser.teamLogo = `${this.globalLink}/${userTeam[i].team.id}/` + userTeam[i].team.logo!;
        teamsWithinUser.myRole = userTeam[i].role.roleName;
        teamsWithinUser.teamStatus = await this.globalTeamsService.findStatusByTeam(userTeam[i].team);
        teamsDTOArray.push(teamsWithinUser);
        teamsWithinUser = {} as MyProject;
      }
      let teamId = teamsDTOArray[0].teamId;
      return this.homeDetailsForTeamMemberAdmin(teamId, teamsDTOArray);
    }
  }

  /**
   * This method will fetch the ADCenter associated with the team,
   * All the teams in associated ADCenter,
   * List of all the ADCenters.
   * And will create and return an object of HomeResponse with the help of fetched Items.
   */
  async homeDetailsForTeamMemberAdmin(teamId: string, teamsDTOArray: MyProject[]) {
    console.log(teamsDTOArray);

    let homeResponse: HomeResponse = {} as HomeResponse;
    homeResponse.My_Center = await this.teamService.getCenterByTeamId(teamId);
    homeResponse.My_Team = teamsDTOArray;
    homeResponse.Teams_In_ADC = await this.globalTeamsService.viewTeamsInADC(teamId);
    homeResponse.ADC_List = await this.adCenterServiceInterface.getAllCenters();
    return homeResponse;
  }

  /**
   * This method will first fetch the associated teams with this perticular user.
   * if the user is not associated with any team then will return privileges for System Admin
   * or else will return null array in privileges.
   */
  async getPrivileges(userId: string): Promise<string[]> {
    let privileges: string[] = [];
    const userTeam = (await this.userTeamService.findUserTeamsByUserId(userId)) as UserTeam[];
    if (userTeam[0].team == null) {
      privileges = await this.userPrivilegeService.getAllPrivilegeForAdmin(userTeam[0].user.id);
      console.log('privilegesssss');
      console.log(privileges);
    } else {
      privileges = [];
    }
    return privileges;
  }
}
