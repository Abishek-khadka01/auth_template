import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JsonwebtokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign<R>(payload: object): string {
    return this.jwtService.sign(payload);
  }

  signAsync(payload: object): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  signWithOptions(payload: object, options: Record<string, unknown>): string {
    return this.jwtService.sign(payload, options);
  }

  decode(token: string) {
    return this.jwtService.decode(token);
  }

  verify<T extends object>(token: string): T {
    return this.jwtService.verify<T>(token);
  }
}
