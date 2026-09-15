(function () {
  function getToken() {
    return localStorage.getItem('nexus_token');
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('nexus_user') || 'null');
    } catch {
      return null;
    }
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function logout() {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    window.location.reload();
  }

  window.NexusAuth = {
    getToken,
    getUser,
    isLoggedIn,
    logout
  };
})();
