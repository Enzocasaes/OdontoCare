export class UserService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  listUsers() {
    return this.userRepository.list();
  }
}
