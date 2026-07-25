export const LocalAuth = {
  getUsers: () => {
    const raw = localStorage.getItem('grindtrack_local_users');
    return raw ? JSON.parse(raw) : {};
  },
  
  signUp: (email: string, password: string, username: string) => {
    const users = LocalAuth.getUsers();
    
    // Check for existing email
    if (users[email]) {
      throw new Error('Account already exists! Please sign in.');
    }

    // Check for existing username (case-insensitive)
    const normalizedUsername = username.toLowerCase().trim();
    const isUsernameTaken = Object.values(users).some(
      (u: any) => u.username?.toLowerCase().trim() === normalizedUsername
    );
    if (isUsernameTaken) {
      throw new Error('Username is already taken. Please choose another one.');
    }

    users[email] = { password, username };
    localStorage.setItem('grindtrack_local_users', JSON.stringify(users));
  },
  
  signIn: (email: string, password: string) => {
    const users = LocalAuth.getUsers();
    const user = users[email];
    if (!user) {
      throw new Error('Account not found! Please sign up first.');
    }
    if (user.password !== password) {
      throw new Error('Invalid email or password.');
    }
    return { email, username: user.username };
  },

  resetPassword: (email: string) => {
    const users = LocalAuth.getUsers();
    if (!users[email]) {
      throw new Error('No account found with this email. Please sign up first.');
    }
    // Simulate sending an email
    console.log(`[LocalAuth] Simulated password reset email sent to: ${email}`);
    return true;
  }
};
