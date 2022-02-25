import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { UserTeam } from '../model/entities/user_team.entity';
import { UserRole } from '../model/entities/user_role.entity';
import { UserRolesDTO } from '../model/dto/UserRolesDTO';
import { IUserPrivilegeService } from './user-privilege.service.inteface';
import { IUserTeamService } from './user-team.service.interface';

@Injectable()
export class UserPrivilegeService extends TypeOrmCrudService<UserRole> implements IUserPrivilegeService {
  constructor(
    @InjectRepository(UserRole) private readonly userRoleRepository: Repository<UserRole>,
    @Inject('IUserTeamService') private readonly userTeamService: IUserTeamService,
  ) {
    super(userRoleRepository);
  }

  /**
   * It returns the privileges based on the fact that whether the user is system admin
   *  or other user(team admin or team member)
   */
  async getUserPrivilegeForTeam(userId: string, teamId: string, isSystemAdmin: boolean): Promise<any> {
    if (isSystemAdmin) {
      return this.getAllPrivilegeForAdmin(userId);
    } else {
      const output = await this.userTeamService.findUserTeamDetails(userId, teamId);
      return this.getPrivilegeList(output);
    }
  }

  /**
   * It returns the privilege list based on the role in the userTeam of the user
   */
  getPrivilegeList(userTeam: UserTeam) {
    let privilegeArray: string[] = [],
      i;
    for (i = 0; i < userTeam?.role.privilege.length; i++) {
      privilegeArray.push(userTeam?.role.privilege[i].privilegeName);
    }
    return privilegeArray;
  }

  async findRole(roleId: string): Promise<UserRole> {
    return (await this.userRoleRepository.findOne({ where: { id: roleId } })) as UserRole;
  }

  /**
   * It first fetches the userteam object of the admin user and returns all the privileges associated
   * with that admin
   */
  async getAllPrivilegeForAdmin(userId: string): Promise<string[]> {
    const userTeam = await this.userTeamService.findUserTeamForAdmin(userId);
    if (userTeam) {
      return this.getPrivilegeList(userTeam);
    } else {
      throw new NotFoundException('privileges not found');
    }
  }

  /**
   * It first fetches all the user roles present in the db and then creates the list of all those user
   *  role ids and names and return it
   */
  async getAllUserRoles(): Promise<UserRolesDTO[]> {
    const roles = await this.userRoleRepository.find();
    if (!roles) {
      throw new NotFoundException('No Roles Found');
    }
    let rolesList = [],
      i;
    for (i = 0; i < roles.length; i++) {
      let userRole: UserRolesDTO = {} as UserRolesDTO;
      userRole.roleId = roles[i]!.id;
      userRole.roleName = roles[i]!.roleName;
      rolesList.push(userRole);
    }
    return rolesList;
  }
}
