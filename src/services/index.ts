
  
import { Application } from '../declarations';
import resize from './resize/resize.service';
import classify from './classify/classify.service';
import users from './users/users.service'
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application) {
  app.configure(resize);
  app.configure(classify);
  app.configure(users)
}