export class UserService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  listUsers(actor) {
    return this.userRepository.listForActor(actor);
  }
}
