import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

const extractJwtFromCookie = (req: Request) => {
  if (req && req.cookies) {
    return req.cookies['access_token'];
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'SUPER_SECRET_KEY',
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, name: payload.name };
  }
}