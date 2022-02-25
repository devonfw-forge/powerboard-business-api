import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { User } from '../model/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { UserTeam } from '../model/entities/user_team.entity';
import { UserDTO } from '../model/dto/UserDTO';
import { TeamsMemberResponse } from '../../../shared/interfaces/teamMemberResponse';
import { UpdateUserRoleDTO } from '../model/dto/UpdateUserRoleDTO';
import { IUserTeamService } from './user-team.service.interface';
import { UserRole } from '../model/entities/user_role.entity';

@Injectable()
export class UserTeamService extends TypeOrmCrudService<UserTeam> implements IUserTeamService {
  constructor(
    @InjectRepository(UserTeam) private readonly userTeamRepository: Repository<UserTeam>,
    @InjectRepository(UserRole) private readonly userRoleRepository: Repository<UserRole>, //@Inject('IUserPrivilegeService') private readonly userPrivilegeService: IUserPrivilegeService,
  ) {
    super(userTeamRepository);
  }

  /**
   * It will add an user to perticular Team,
   * and will return an object of saved UserTeam Object.
   */
  async addUserToTeam(actualUser: User, userDTO: UserDTO): Promise<any> {
    let userTeam = new UserTeam();
    userTeam.user = actualUser;

    const roleObj = (await this.userRoleRepository.findOne({ where: { id: userDTO.role } })) as UserRole;
    const output = (await this.userTeamRepository.findOne({
      where: { user: actualUser.id, team: userDTO.team.id },
    })) as UserTeam;
    console.log('output from userTeamRepository');
    console.log(output);
    if (output) {
      throw new ConflictException('User in team already exists');
    }
    userTeam.role = roleObj;
    userTeam.team = userDTO.team;
    return this.userTeamRepository.save(userTeam);
  }

  /**
   * It will delete an user from Team by the help of UserTeamId,
   * and will return an object of DeleteResult.
   */
  async deleteUserFromTeamById(id: string): Promise<DeleteResult> {
    const userTeam = (await this.userTeamRepository.findOne({ where: { id: id } })) as UserTeam;
    if (!userTeam) {
      throw new NotFoundException('user not found for that team');
    } else {
      return this.userTeamRepository.delete(id);
    }
  }

  /**
   * It will fetch all the members associated with the incoming Team,
   * and return an Array of TeamsMemberResponse.
   */
  async getAllMemberOfTeam(teamId: string): Promise<TeamsMemberResponse[]> {
    const result = await this.userTeamRepository.find({ where: { team: teamId } });
    if (result.length == 0) {
      throw new NotFoundException('No Member Found in team');
    }
    let teamsMemberResponse: TeamsMemberResponse = {} as TeamsMemberResponse;
    let teamMemberList = [],
      i;
    for (i = 0; i < result.length; i++) {
      teamsMemberResponse.userTeamId = result[i].id;
      teamsMemberResponse.userId = result[i].user.id;
      teamsMemberResponse.teamId = result[i].team.id;
      teamsMemberResponse.roleId = result[i].role.id;
      teamsMemberResponse.userName = result[i].user.username;
      teamsMemberResponse.email = result[i].user.email;
      teamMemberList.push(teamsMemberResponse);

      teamsMemberResponse = {} as TeamsMemberResponse;
    }
    return teamMemberList;
  }

  /**
   * It will fetch & return an object of UserTeam on basis of userId only
   * for Team Admin.
   */
  async findUserTeamForAdmin(userId: string) {
    return (await this.userTeamRepository.findOne({ where: { user: userId } })) as UserTeam;
  }

  /**
   * It will update an role of user in perticular team,
   * If UserTeam object not found for that perticular user and team then will throw
   * an error,
   * or else will return an updated UserTeam object.
   */
  async updateUserRole(updateRoleDTO: UpdateUserRoleDTO): Promise<UserTeam> {
    let userTeam = (await this.userTeamRepository.findOne({
      where: { user: updateRoleDTO.userId, team: updateRoleDTO.teamId },
    })) as UserTeam;

    if (!userTeam) {
      throw new NotFoundException('User in team not found');
    }
    let userTeamOBJ = new UserTeam();
    userTeamOBJ.id = userTeam.id;
    userTeamOBJ.role = (await this.userRoleRepository.findOne({ where: { id: updateRoleDTO.roleId } })) as UserRole;
    return this.userTeamRepository.save(userTeamOBJ);
  }

  /**
   * This method will fetch array of UserTeam on basis of userId
   */
  findUserTeamsByUserId(id: string) {
    return this.userTeamRepository.find({ where: { user: id } });
  }

  /**
   * It will figure out whether the userId is System Admin or not.
   */
  async isSystemAdmin(userId: string): Promise<boolean> {
    const output = (await this.userTeamRepository.findOne({ where: { user: userId } })) as UserTeam;
    if (output.role.roleName == 'system_admin') {
      return true;
    }
    return false;
  }

  /**
   * findUserTeamDetails method will fetch & return an UserTeam object on basis
   * of userId and teamId
   */
  async findUserTeamDetails(userId: string, teamId: string) {
    return (await this.userTeamRepository.findOne({ where: { user: userId, team: teamId } })) as UserTeam;
  }
}
