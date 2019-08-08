// @flow
import crypto from 'crypto';
import Router from 'koa-router';
import { capitalize } from 'lodash';
import { User, Team, Event } from '../models';
import auth from '../middlewares/authentication';
import { verifyGenericAuthJWT } from '../utils/jwtAuth';

const router = new Router();

// signin callback from JWT Provider
router.get('jwtgeneric.callback', auth({ required: false }), async ctx => {
  const { code } = ctx.request.query;
  ctx.assertPresent(code, 'code is required');
  const payload = await verifyGenericAuthJWT(code);
  

  const genericJwtId = payload.teamId;
  const hostname = payload.teamName.toLowerCase().split(" ").join("");
  const teamName = payload.teamName;

  const avatarUrl = payload.avatar || "https://tc-beta-cdn-imgs.oss-cn-hongkong.aliyuncs.com/outline/defaults/profile-001.png";

  const [team, isFirstUser] = await Team.findOrCreate({
    where: {
      genericJwtId,
    },
    defaults: {
      name: teamName,
      avatarUrl,
    },
  });

  const [user, isFirstSignin] = await User.findOrCreate({
    where: {
      service: 'jwtgeneric',
      serviceId: payload.userId,
      teamId: team.id,
    },
    defaults: {
      name: payload.name,
      email: payload.email,
      isAdmin: isFirstUser,
      avatarUrl: avatarUrl,
    },
  });

  if (isFirstSignin) {
    await Event.create({
      name: 'users.create',
      actorId: user.id,
      userId: user.id,
      teamId: team.id,
      data: {
        name: user.name,
        service: 'jwtgeneric',
      },
      ip: ctx.request.ip,
    });
  }

  // update email address if it's changed in the newest JWT
  if (!isFirstSignin && payload.email !== user.email) {
    await user.update({ email: payload.email });
  }

  if (isFirstUser) {
    await team.provisionFirstCollection(user.id);
    await team.provisionSubdomain(hostname);
  }

  // set cookies on response and redirect to team subdomain
  ctx.signIn(user, team, 'jwtgeneric', isFirstSignin);
});

export default router;
