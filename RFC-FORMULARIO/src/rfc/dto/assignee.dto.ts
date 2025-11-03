import { ApiProperty } from '@nestjs/swagger';

export class AssigneeDto {
  @ApiProperty({ example: 'ErickGuerron' })
  login!: string;

  @ApiProperty({ example: 'Erick Guerrón', nullable: true })
  name!: string | null;

  @ApiProperty({
    example: 'https://avatars.githubusercontent.com/u/1234567?v=4',
    description: 'URL del avatar del usuario en GitHub'
  })
  avatarUrl!: string;
}
