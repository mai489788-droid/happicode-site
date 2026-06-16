document.addEventListener('DOMContentLoaded', function () {
  initNavbarScroll();
  initSmoothScroll();
  initNavHighlight();
  initNavAuthState();
  initExploreCodeGate();
  initLoginForm();
  initRegisterForm();
  initAdminLoginForm();
  initAdminDashboard();
  initHomePage();
  initServicesPage();
  initUserDashboard();
});

var STORAGE_LOGGED_IN = 'drgifter_logged_in';
var STORAGE_REDIRECT = 'drgifter_redirect_after_login';
var STORAGE_USERS = 'users';
var STORAGE_CURRENT_USER = 'currentUser';
var STORAGE_SPENDING = 'drgifter_total_spending';
var STORAGE_PURCHASES = 'drgifter_purchases';
var STORAGE_ORDERS = 'orders';
var STORAGE_LEGACY_ORDERS = 'drgifter_admin_orders';
var STORAGE_USER_LOGIN_FAILURES = 'drgifter_user_login_failures';
var STORAGE_USER_LOGIN_LOCKED = 'drgifter_user_login_locked';
var STORAGE_ADMIN_LOGIN_FAILURES = 'drgifter_admin_login_failures';
var STORAGE_ADMIN_LOGIN_LOCKED = 'drgifter_admin_login_locked';
var STORAGE_CUSTOM_PRODUCTS = 'customProducts';
var STORAGE_DEPOSIT_REQUESTS = 'depositRequests';
var MAX_LOGIN_FAILURES = 5;
var ADMIN_USERNAME = 'admin';
var ADMIN_PASSWORD = 'admin123';

function isUserLoggedIn() {
  return getCurrentUser() !== null;
}

function getUsers() {
  var data = localStorage.getItem(STORAGE_USERS);
  if (!data) {
    return [];
  }
  return JSON.parse(data);
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function findUserByEmail(email) {
  var users = getUsers();
  var i;
  var normalizedEmail = email.toLowerCase().trim();

  for (i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === normalizedEmail) {
      return users[i];
    }
  }

  return null;
}

function emailExists(email) {
  return findUserByEmail(email) !== null;
}

function getCurrentUser() {
  var data = localStorage.getItem(STORAGE_CURRENT_USER);
  if (!data) {
    return null;
  }
  return JSON.parse(data);
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify({
    name: user.name,
    email: user.email,
    balance: user.balance || 0
  }));
  localStorage.setItem(STORAGE_LOGGED_IN, 'true');
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_CURRENT_USER);
  localStorage.removeItem(STORAGE_LOGGED_IN);
}

function setUserLoggedIn(email, name) {
  setCurrentUser({ name: name, email: email });
}

function getUserEmail() {
  var user = getCurrentUser();
  if (user) {
    return user.email;
  }
  return '';
}

function getUserName() {
  var user = getCurrentUser();
  if (user) {
    return user.name;
  }
  return 'Người dùng';
}

function getUserPassword() {
  var user = getCurrentUser();
  if (!user) {
    return '';
  }
  var found = findUserByEmail(user.email);
  if (found) {
    return found.password;
  }
  return '';
}

function updateUserPassword(email, newPassword) {
  var users = getUsers();
  var i;

  for (i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === email.toLowerCase()) {
      users[i].password = newPassword;
      break;
    }
  }

  saveUsers(users);
}

function getTotalSpending() {
  var spending = localStorage.getItem(STORAGE_SPENDING);
  if (!spending) {
    return 0;
  }
  return parseInt(spending, 10);
}

function setTotalSpending(amount) {
  localStorage.setItem(STORAGE_SPENDING, String(amount));
}

function getPurchases() {
  var data = localStorage.getItem(STORAGE_PURCHASES);
  if (!data) {
    return [];
  }
  return JSON.parse(data);
}

function savePurchases(purchases) {
  localStorage.setItem(STORAGE_PURCHASES, JSON.stringify(purchases));
}

function getOrders() {
  var data = localStorage.getItem(STORAGE_ORDERS);
  if (data) {
    return JSON.parse(data);
  }

  var legacyData = localStorage.getItem(STORAGE_LEGACY_ORDERS);
  if (legacyData) {
    var legacyOrders = JSON.parse(legacyData);
    var realOrders = [];
    var i;

    for (i = 0; i < legacyOrders.length; i++) {
      if (legacyOrders[i].id.indexOf('seed') !== 0) {
        realOrders.push(legacyOrders[i]);
      }
    }

    saveOrders(realOrders);
    localStorage.removeItem(STORAGE_LEGACY_ORDERS);
    return realOrders;
  }

  return [];
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
}

function getAdminOrders() {
  return getOrders();
}

function saveAdminOrders(orders) {
  saveOrders(orders);
}

function getCustomProducts() {
  var data = localStorage.getItem(STORAGE_CUSTOM_PRODUCTS);
  if (!data) {
    return [];
  }
  return JSON.parse(data);
}

function saveCustomProducts(products) {
  localStorage.setItem(STORAGE_CUSTOM_PRODUCTS, JSON.stringify(products));
}

function getDepositRequests() {
  var data = localStorage.getItem(STORAGE_DEPOSIT_REQUESTS);
  if (!data) {
    return [];
  }
  return JSON.parse(data);
}

function saveDepositRequests(requests) {
  localStorage.setItem(STORAGE_DEPOSIT_REQUESTS, JSON.stringify(requests));
}

function deleteCustomProduct(productId) {
  var products = getCustomProducts();
  var filtered = [];
  var i;

  for (i = 0; i < products.length; i++) {
    if (products[i].id !== productId) {
      filtered.push(products[i]);
    }
  }

  saveCustomProducts(filtered);
}

function getInitials(name) {
  var parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function formatCurrency(amount) {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1).replace('.0', '') + 'tr';
  }
  return amount.toLocaleString('vi-VN') + 'đ';
}

function formatDate(dateString) {
  var parts = dateString.split('T')[0].split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function initNavAuthState() {
  var navLoginItem = document.getElementById('navLoginItem');
  var navRegisterItem = document.getElementById('navRegisterItem');
  var navLoggedInItem = document.getElementById('navLoggedInItem');
  var navGreetingText = document.getElementById('navGreetingText');
  var navLogoutBtn = document.getElementById('navLogoutBtn');

  if (!navLoginItem && !navLoggedInItem) {
    return;
  }

  if (isUserLoggedIn()) {
    if (navLoginItem) {
      navLoginItem.style.display = 'none';
    }
    if (navRegisterItem) {
      navRegisterItem.style.display = 'none';
    }
    if (navLoggedInItem) {
      navLoggedInItem.style.display = 'block';
    }
    if (navGreetingText) {
      navGreetingText.textContent = 'Xin chào, ' + getUserName() + '! 💕';
    }
  } else {
    if (navLoginItem) {
      navLoginItem.style.display = 'block';
    }
    if (navRegisterItem) {
      navRegisterItem.style.display = 'block';
    }
    if (navLoggedInItem) {
      navLoggedInItem.style.display = 'none';
    }
  }

  if (navLogoutBtn) {
    navLogoutBtn.addEventListener('click', function () {
      clearCurrentUser();
      window.location.reload();
    });
  }
}

function initExploreCodeGate() {
  var exploreBtn = document.getElementById('exploreCodeBtn');
  if (!exploreBtn) {
    return;
  }

  exploreBtn.addEventListener('click', function () {
    if (isUserLoggedIn()) {
      window.location.href = 'services.html';
    } else {
      localStorage.setItem(STORAGE_REDIRECT, 'services');
      window.location.href = 'login.html';
    }
  });
}

function initHomePage() {
  var featuredGrid = document.getElementById('featuredProductGrid');
  if (!featuredGrid) {
    return;
  }

  renderFeaturedProducts(featuredGrid);

  featuredGrid.addEventListener('click', function (event) {
    var button = event.target.closest('.btn-product');
    if (button) {
      handleProductButtonClick(button);
    }
  });
}

function renderFeaturedProducts(grid) {
  var emptyEl = document.getElementById('featuredEmpty');
  var products = getCustomProducts();
  var latest = [];
  var i;

  grid.innerHTML = '';

  if (products.length === 0) {
    if (emptyEl) {
      emptyEl.style.display = 'block';
    }
    return;
  }

  if (emptyEl) {
    emptyEl.style.display = 'none';
  }

  for (i = products.length - 1; i >= 0 && latest.length < 4; i--) {
    latest.push(products[i]);
  }

  latest.forEach(function (product, index) {
    grid.appendChild(buildCustomProductCard(product, index));
  });
}

function initNavbarScroll() {
  var mainNav = document.getElementById('mainNav');
  if (!mainNav) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      mainNav.classList.add('scrolled');
    } else {
      mainNav.classList.remove('scrolled');
    }
  });
}

function initSmoothScroll() {
  var navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      var targetId = link.getAttribute('href');
      if (targetId.length <= 1) return;
      var targetElement = document.querySelector(targetId);
      if (targetElement) {
        event.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function initNavHighlight() {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link-animated[data-nav]');
  if (sections.length === 0 || navLinks.length === 0) return;

  window.addEventListener('scroll', function () {
    var scrollPos = window.scrollY + 120;
    sections.forEach(function (section) {
      var sectionTop = section.offsetTop;
      var sectionHeight = section.offsetHeight;
      var sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('data-nav') === sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

function initLoginForm() {
  var loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  var loginEmail = document.getElementById('loginEmail');
  var loginPassword = document.getElementById('loginPassword');
  var rememberMe = document.getElementById('rememberMe');
  var submitBtn = loginForm.querySelector('.auth-submit-btn');
  var lockBanner = document.getElementById('loginLockBanner');

  if (isAccountLocked(STORAGE_USER_LOGIN_LOCKED)) {
    applyFormLock(loginForm, lockBanner, [loginEmail, loginPassword, rememberMe], submitBtn);
    return;
  }

  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    if (isAccountLocked(STORAGE_USER_LOGIN_LOCKED)) {
      applyFormLock(loginForm, lockBanner, [loginEmail, loginPassword, rememberMe], submitBtn);
      return;
    }

    var email = loginEmail.value.trim();
    var password = loginPassword.value;
    var matchedUser = findUserByEmail(email);
    var isValid = matchedUser !== null && matchedUser.password === password;

    if (!isValid) {
      var failures = getLoginFailures(STORAGE_USER_LOGIN_FAILURES) + 1;
      setLoginFailures(STORAGE_USER_LOGIN_FAILURES, failures);

      if (failures >= MAX_LOGIN_FAILURES) {
        setAccountLocked(STORAGE_USER_LOGIN_LOCKED, true);
        applyFormLock(loginForm, lockBanner, [loginEmail, loginPassword, rememberMe], submitBtn);
        return;
      }

      showFormAlert(loginForm, 'Sai tài khoản hoặc mật khẩu! Còn ' + (MAX_LOGIN_FAILURES - failures) + ' lần thử.', 'danger');
      return;
    }

    resetLoginSecurity(STORAGE_USER_LOGIN_FAILURES, STORAGE_USER_LOGIN_LOCKED);
    setCurrentUser(matchedUser);

    var redirectTarget = localStorage.getItem(STORAGE_REDIRECT);
    localStorage.removeItem(STORAGE_REDIRECT);

    showFormAlert(loginForm, 'Đăng nhập thành công!', 'success');

    setTimeout(function () {
      if (redirectTarget === 'services') {
        window.location.href = 'services.html';
      } else {
        window.location.href = 'index.html';
      }
    }, 1200);
  });
}

function initAdminLoginForm() {
  var adminLoginForm = document.getElementById('adminLoginForm');
  if (!adminLoginForm) return;

  var adminUsername = document.getElementById('adminUsername');
  var adminPassword = document.getElementById('adminPassword');
  var submitBtn = adminLoginForm.querySelector('.auth-submit-btn');
  var lockBanner = document.getElementById('adminLoginLockBanner');

  if (isAccountLocked(STORAGE_ADMIN_LOGIN_LOCKED)) {
    applyFormLock(adminLoginForm, lockBanner, [adminUsername, adminPassword], submitBtn);
    return;
  }

  adminLoginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    if (isAccountLocked(STORAGE_ADMIN_LOGIN_LOCKED)) {
      applyFormLock(adminLoginForm, lockBanner, [adminUsername, adminPassword], submitBtn);
      return;
    }

    var username = adminUsername.value.trim();
    var password = adminPassword.value;
    var isValid = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;

    if (!isValid) {
      var failures = getLoginFailures(STORAGE_ADMIN_LOGIN_FAILURES) + 1;
      setLoginFailures(STORAGE_ADMIN_LOGIN_FAILURES, failures);

      if (failures >= MAX_LOGIN_FAILURES) {
        setAccountLocked(STORAGE_ADMIN_LOGIN_LOCKED, true);
        applyFormLock(adminLoginForm, lockBanner, [adminUsername, adminPassword], submitBtn);
        return;
      }

      showFormAlert(adminLoginForm, 'Tên đăng nhập hoặc mật khẩu không đúng. Còn ' + (MAX_LOGIN_FAILURES - failures) + ' lần thử.', 'danger');
      return;
    }

    resetLoginSecurity(STORAGE_ADMIN_LOGIN_FAILURES, STORAGE_ADMIN_LOGIN_LOCKED);
    window.location.href = 'admin-dashboard.html';
  });
}

function getLoginFailures(storageKey) {
  var value = localStorage.getItem(storageKey);
  if (!value) {
    return 0;
  }
  return parseInt(value, 10);
}

function setLoginFailures(storageKey, count) {
  localStorage.setItem(storageKey, String(count));
}

function isAccountLocked(storageKey) {
  return localStorage.getItem(storageKey) === 'true';
}

function setAccountLocked(storageKey, locked) {
  localStorage.setItem(storageKey, locked ? 'true' : 'false');
}

function resetLoginSecurity(failuresKey, lockedKey) {
  localStorage.setItem(failuresKey, '0');
  localStorage.setItem(lockedKey, 'false');
}

function applyFormLock(form, banner, inputs, submitBtn) {
  var lockMessage = 'Tài khoản của bạn đã bị khóa do nhập sai quá 5 lần! Vui lòng liên hệ quản trị viên.';

  if (banner) {
    banner.textContent = lockMessage;
    banner.style.display = 'block';
  }

  inputs.forEach(function (input) {
    if (input) {
      input.disabled = true;
    }
  });

  if (submitBtn) {
    submitBtn.disabled = true;
  }

  if (form) {
    form.classList.add('form-locked');
  }
}

function initRegisterForm() {
  var registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  registerForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var password = document.getElementById('registerPassword').value;
    var confirmPassword = document.getElementById('registerConfirmPassword').value;
    var fullName = document.getElementById('registerFullName').value.trim();
    var email = document.getElementById('registerEmail').value.trim();

    if (password !== confirmPassword) {
      showFormAlert(registerForm, 'Mật khẩu không khớp, vui lòng thử lại nhé.', 'danger');
      return;
    }

    if (emailExists(email)) {
      showFormAlert(registerForm, 'Email này đã được đăng ký!', 'danger');
      return;
    }

    var users = getUsers();
    users.push({
      name: fullName,
      email: email,
      password: password,
      balance: 0
    });
    saveUsers(users);

    showFormAlert(registerForm, 'Đăng ký tài khoản thành công!', 'success');

    setTimeout(function () {
      window.location.href = 'login.html';
    }, 1200);
  });
}

function initAdminDashboard() {
  var sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
  var sidebarToggle = document.getElementById('sidebarToggle');
  var adminSidebar = document.getElementById('adminSidebar');
  var sidebarOverlay = document.getElementById('sidebarOverlay');
  var pageTitle = document.getElementById('pageTitle');
  var requestsTableBody = document.getElementById('requestsTableBody');

  if (!adminSidebar) {
    return;
  }

  var sectionTitles = {
    dashboard: 'Bảng điều khiển',
    users: 'Quản lý người dùng',
    requests: 'Yêu cầu dịch vụ',
    products: 'Quản lý sản phẩm',
    deposits: 'Quản lý nạp tiền'
  };

  renderAdminDashboard();
  renderUsersTable();
  initProductManagement();
  initDepositManagement();

  sidebarLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      var sectionName = link.getAttribute('data-section');
      switchSection(sectionName);
      sidebarLinks.forEach(function (item) {
        item.classList.remove('active');
      });
      link.classList.add('active');
      if (pageTitle) {
        pageTitle.textContent = sectionTitles[sectionName] || 'Bảng điều khiển';
      }
      closeSidebar();
    });
  });

  if (sidebarToggle && adminSidebar) {
    sidebarToggle.addEventListener('click', function () {
      adminSidebar.classList.toggle('show');
      if (sidebarOverlay) {
        sidebarOverlay.classList.toggle('show');
      }
    });
  }

  if (sidebarOverlay && adminSidebar) {
    sidebarOverlay.addEventListener('click', function () {
      closeSidebar();
    });
  }

  if (requestsTableBody) {
    requestsTableBody.addEventListener('click', function (event) {
      var button = event.target.closest('.action-btn');
      if (!button) {
        return;
      }

      var action = button.getAttribute('data-action');
      var row = button.closest('tr');
      var orderId = row.getAttribute('data-order-id');
      var clientName = row.querySelector('.client-cell span').textContent;
      var statusBadge = row.querySelector('.status-badge');

      if (action === 'approve' && statusBadge && orderId) {
        statusBadge.textContent = 'Hoàn thành';
        statusBadge.className = 'status-badge status-completed';
        updateAdminOrderStatus(orderId, 'Hoàn thành');
      }

      if (action === 'view') {
        alert('Đang xem yêu cầu từ ' + clientName);
      }
    });
  }

  function switchSection(sectionName) {
    var sections = document.querySelectorAll('.content-section');
    sections.forEach(function (section) {
      section.classList.remove('active');
    });
    var targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
      targetSection.classList.add('active');
    }
  }

  function closeSidebar() {
    if (adminSidebar) {
      adminSidebar.classList.remove('show');
    }
    if (sidebarOverlay) {
      sidebarOverlay.classList.remove('show');
    }
  }
}

function updateAdminOrderStatus(orderId, status) {
  var orders = getAdminOrders();
  orders.forEach(function (order) {
    if (order.id === orderId) {
      order.status = status;
    }
  });
  saveAdminOrders(orders);
}

function renderAdminDashboard() {
  var orders = getOrders();
  var users = getUsers();
  var tableBody = document.getElementById('requestsTableBody');
  var totalUsersEl = document.getElementById('totalUsersMetric');
  var totalOrdersEl = document.getElementById('totalOrdersMetric');
  var revenueEl = document.getElementById('revenueMetric');
  var activeUsersEl = document.getElementById('activeUsersMetric');

  if (!tableBody) {
    return;
  }

  var totalRevenue = 0;
  var activeNames = {};

  orders.forEach(function (order) {
    totalRevenue = totalRevenue + (order.price || 0);
    if (order.clientName) {
      activeNames[order.clientName] = true;
    }
  });

  if (totalUsersEl) {
    totalUsersEl.textContent = String(users.length);
  }
  if (totalOrdersEl) {
    totalOrdersEl.textContent = String(orders.length);
  }
  if (activeUsersEl) {
    activeUsersEl.textContent = String(Object.keys(activeNames).length);
  }
  if (revenueEl) {
    if (totalRevenue === 0) {
      revenueEl.textContent = '0 VNĐ';
    } else {
      revenueEl.textContent = formatCurrency(totalRevenue);
    }
  }

  tableBody.innerHTML = '';

  if (orders.length === 0) {
    var emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="4" class="text-center empty-users-row">Chưa có yêu cầu nào</td>';
    tableBody.appendChild(emptyRow);
    return;
  }

  var sortedOrders = orders.slice().reverse();

  sortedOrders.forEach(function (order) {
    var statusClass = 'status-pending';
    var statusText = 'Chờ xử lý';

    if (order.status === 'Đang xử lý' || order.status === 'progress') {
      statusClass = 'status-progress';
      statusText = 'Đang xử lý';
    }
    if (order.status === 'Hoàn thành' || order.status === 'completed') {
      statusClass = 'status-completed';
      statusText = 'Hoàn thành';
    }
    if (order.status === 'Chờ xử lý' || order.status === 'pending') {
      statusClass = 'status-pending';
      statusText = 'Chờ xử lý';
    }

    var row = document.createElement('tr');
    row.setAttribute('data-order-id', order.id);
    row.innerHTML =
      '<td data-label="Khách hàng">' +
        '<div class="client-cell">' +
          '<div class="client-avatar">' + getInitials(order.clientName) + '</div>' +
          '<span>' + order.clientName + '</span>' +
        '</div>' +
      '</td>' +
      '<td data-label="Dịch vụ">' + order.serviceType + '</td>' +
      '<td data-label="Trạng thái"><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
      '<td data-label="Thao tác">' +
        '<button class="btn btn-action btn-action-view action-btn" data-action="view">Xem</button>' +
        '<button class="btn btn-action btn-action-approve action-btn" data-action="approve">Duyệt</button>' +
      '</td>';

    tableBody.appendChild(row);
  });
}

function renderUsersTable() {
  var usersTableBody = document.getElementById('usersTableBody');
  if (!usersTableBody) {
    return;
  }

  var users = getUsers();
  usersTableBody.innerHTML = '';

  if (users.length === 0) {
    var emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="3" class="text-center empty-users-row">Chưa có thành viên nào đăng ký</td>';
    usersTableBody.appendChild(emptyRow);
    return;
  }

  users.forEach(function (user) {
    var row = document.createElement('tr');
    row.innerHTML =
      '<td data-label="Họ và tên">' +
        '<div class="client-cell">' +
          '<div class="client-avatar">' + getInitials(user.name) + '</div>' +
          '<span>' + user.name + '</span>' +
        '</div>' +
      '</td>' +
      '<td data-label="Email">' + user.email + '</td>' +
      '<td data-label="Trạng thái"><span class="status-badge status-completed">Hoạt động</span></td>';
    usersTableBody.appendChild(row);
  });
}

function renderAdminProductsTable() {
  var tableBody = document.getElementById('adminProductsTableBody');
  if (!tableBody) {
    return;
  }

  var products = getCustomProducts();
  tableBody.innerHTML = '';

  if (products.length === 0) {
    var emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="3" class="text-center empty-users-row">Chưa có sản phẩm tùy chỉnh nào</td>';
    tableBody.appendChild(emptyRow);
    return;
  }

  products.forEach(function (product) {
    var row = document.createElement('tr');
    row.innerHTML =
      '<td data-label="Tên sản phẩm">' + product.name + '</td>' +
      '<td data-label="Giá">' + formatCurrency(product.price) + '</td>' +
      '<td data-label="Hành động">' +
        '<button type="button" class="btn btn-action btn-action-view delete-product-btn" data-product-id="' + product.id + '">Xóa</button>' +
      '</td>';
    tableBody.appendChild(row);
  });
}

function initProductManagement() {
  var addProductForm = document.getElementById('addProductForm');
  var adminProductsTableBody = document.getElementById('adminProductsTableBody');

  if (!addProductForm && !adminProductsTableBody) {
    return;
  }

  renderAdminProductsTable();

  if (addProductForm) {
    addProductForm.addEventListener('submit', function (event) {
      event.preventDefault();

      var name = document.getElementById('productNameInput').value.trim();
      var price = parseInt(document.getElementById('productPriceInput').value, 10);
      var videoUrl = document.getElementById('productVideoUrlInput').value.trim();
      var demoUrl = document.getElementById('productDemoUrlInput').value.trim();
      var description = document.getElementById('productDescriptionInput').value.trim();

      var products = getCustomProducts();
      products.push({
        id: 'custom_' + Date.now(),
        name: name,
        price: price,
        videoUrl: videoUrl,
        demoUrl: demoUrl,
        description: description
      });
      saveCustomProducts(products);

      showFormAlert(addProductForm, 'Thêm sản phẩm mới thành công!', 'success');
      addProductForm.reset();
      renderAdminProductsTable();
    });
  }

  if (adminProductsTableBody) {
    adminProductsTableBody.addEventListener('click', function (event) {
      var deleteBtn = event.target.closest('.delete-product-btn');
      if (!deleteBtn) {
        return;
      }

      var productId = deleteBtn.getAttribute('data-product-id');
      deleteCustomProduct(productId);
      renderAdminProductsTable();
    });
  }
}

function renderDepositRequestsTable() {
  var tableBody = document.getElementById('depositRequestsTableBody');
  if (!tableBody) {
    return;
  }

  var requests = getDepositRequests();
  tableBody.innerHTML = '';

  if (requests.length === 0) {
    var emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="6" class="text-center empty-users-row">Chưa có yêu cầu nạp tiền nào</td>';
    tableBody.appendChild(emptyRow);
    return;
  }

  requests.slice().reverse().forEach(function (request) {
    var statusClass = 'status-pending';
    if (request.status === 'Đã duyệt') {
      statusClass = 'status-completed';
    }
    if (request.status === 'Đã hủy') {
      statusClass = 'status-progress';
    }

    var row = document.createElement('tr');
    row.innerHTML =
      '<td data-label="Khách hàng">' + request.clientName + '</td>' +
      '<td data-label="Email">' + request.clientEmail + '</td>' +
      '<td data-label="Số tiền">' + formatCurrency(request.amount) + '</td>' +
      '<td data-label="Mã giao dịch">' + request.transactionCode + '</td>' +
      '<td data-label="Trạng thái"><span class="status-badge ' + statusClass + '">' + request.status + '</span></td>' +
      '<td data-label="Thao tác">' +
        '<button type="button" class="btn btn-action btn-action-approve deposit-action-btn" data-action="approve" data-request-id="' + request.id + '">Duyệt</button>' +
        '<button type="button" class="btn btn-action btn-action-view deposit-action-btn" data-action="cancel" data-request-id="' + request.id + '">Hủy</button>' +
      '</td>';
    tableBody.appendChild(row);
  });
}

function initDepositManagement() {
  var tableBody = document.getElementById('depositRequestsTableBody');
  if (!tableBody) {
    return;
  }

  renderDepositRequestsTable();

  tableBody.addEventListener('click', function (event) {
    var button = event.target.closest('.deposit-action-btn');
    if (!button) {
      return;
    }

    var action = button.getAttribute('data-action');
    var requestId = button.getAttribute('data-request-id');
    var requests = getDepositRequests();
    var users = getUsers();
    var currentUser = getCurrentUser();

    requests.forEach(function (request) {
      if (request.id !== requestId || request.status !== 'Chờ duyệt') {
        return;
      }

      if (action === 'approve') {
        request.status = 'Đã duyệt';
        users.forEach(function (user) {
          if (user.email.toLowerCase() === request.clientEmail.toLowerCase()) {
            if (!user.balance) {
              user.balance = 0;
            }
            user.balance = user.balance + request.amount;
          }
        });

        if (currentUser && currentUser.email.toLowerCase() === request.clientEmail.toLowerCase()) {
          if (!currentUser.balance) {
            currentUser.balance = 0;
          }
          currentUser.balance = currentUser.balance + request.amount;
          localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(currentUser));
        }
      }

      if (action === 'cancel') {
        request.status = 'Đã hủy';
      }
    });

    saveUsers(users);
    saveDepositRequests(requests);
    renderDepositRequestsTable();
    renderAdminDashboard();
    renderUsersTable();
  });
}

function buildCustomProductCard(product, index) {
  var previewClasses = ['product-preview-1', 'product-preview-2', 'product-preview-3', 'product-preview-4', 'product-preview-5', 'product-preview-6'];
  var previewClass = previewClasses[index % previewClasses.length];
  var isFree = product.price === 0 ? 'true' : 'false';
  var tags = product.name.toLowerCase() + ' ' + product.description.toLowerCase();

  var col = document.createElement('div');
  col.className = 'col-sm-6 col-lg-4 product-col product-col-custom';
  col.setAttribute('data-custom', 'true');
  col.setAttribute('data-title', product.name);
  col.setAttribute('data-tags', tags);
  col.setAttribute('data-free', isFree);
  col.setAttribute('data-price', String(product.price));
  col.setAttribute('data-video-url', product.videoUrl);
  col.setAttribute('data-demo-url', product.demoUrl);
  col.setAttribute('data-github-url', product.githubUrl || product.demoUrl || '');

  col.innerHTML =
    '<article class="product-card">' +
      '<div class="product-preview ' + previewClass + '">' +
        '<i class="bi bi-stars"></i>' +
      '</div>' +
      '<h2 class="product-title">' + product.name + '</h2>' +
      '<p class="product-price">Giá: ' + formatCurrency(product.price) + '</p>' +
      '<p class="product-desc">' + product.description + '</p>' +
      '<div class="product-btn-group">' +
        '<button type="button" class="btn-product btn-video" data-action="video">Video</button>' +
        '<button type="button" class="btn-product btn-buy" data-action="buy">Mua ngay</button>' +
        '<button type="button" class="btn-product btn-demo" data-action="demo">Xem Demo</button>' +
      '</div>' +
    '</article>';

  return col;
}

function renderCustomProductsOnGrid(productGrid) {
  var existingCustom = productGrid.querySelectorAll('.product-col-custom');
  var i;

  for (i = 0; i < existingCustom.length; i++) {
    existingCustom[i].remove();
  }

  var products = getCustomProducts();
  products.forEach(function (product, index) {
    productGrid.appendChild(buildCustomProductCard(product, index));
  });
}

function handleProductButtonClick(button) {
  var card = button.closest('.product-col');
  var title = card.getAttribute('data-title');
  var price = parseInt(card.getAttribute('data-price'), 10);
  var videoUrl = card.getAttribute('data-video-url');
  var demoUrl = card.getAttribute('data-demo-url');
  var githubUrl = card.getAttribute('data-github-url');
  var descriptionEl = card.querySelector('.product-desc');
  var description = '';
  var action = button.getAttribute('data-action');

  if (descriptionEl) {
    description = descriptionEl.textContent.trim();
  }

  if (action === 'video') {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    } else {
      alert('Chưa có đường dẫn video cho sản phẩm này.');
    }
  }

  if (action === 'buy') {
    openPurchaseConfirmModal({
      title: title,
      price: price,
      githubUrl: githubUrl,
      description: description
    });
  }

  if (action === 'demo') {
    if (demoUrl) {
      window.open(demoUrl, '_blank');
    } else {
      alert('Chưa có đường dẫn demo cho sản phẩm này.');
    }
  }
}

function addPurchaseToUserAccount(email, purchase, price) {
  var users = getUsers();
  var i;
  var currentUser = getCurrentUser();

  for (i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === email.toLowerCase()) {
      if (!users[i].purchases) {
        users[i].purchases = [];
      }
      users[i].purchases.push(purchase);
      if (!users[i].totalSpending) {
        users[i].totalSpending = 0;
      }
      users[i].totalSpending = users[i].totalSpending + price;
      break;
    }
  }

  saveUsers(users);

  if (currentUser) {
    if (!currentUser.purchases) {
      currentUser.purchases = [];
    }
    currentUser.purchases.push(purchase);
    if (!currentUser.totalSpending) {
      currentUser.totalSpending = 0;
    }
    currentUser.totalSpending = currentUser.totalSpending + price;
    localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(currentUser));
  }
}

function getRedirectPageName() {
  var path = window.location.pathname;
  var page = path.split('/').pop();
  if (page === 'services.html') {
    return 'services';
  }
  return 'index';
}

function processPurchase(productInfo) {
  if (!isUserLoggedIn()) {
    localStorage.setItem(STORAGE_REDIRECT, getRedirectPageName());
    alert('Vui lòng đăng nhập để mua sản phẩm!');
    window.location.href = 'login.html';
    return false;
  }

  var title = productInfo.title;
  var price = productInfo.price;
  var userName = getUserName();
  var userEmail = getUserEmail();
  var purchaseId = 'purchase_' + Date.now();
  var orderId = 'order_' + Date.now();
  var now = new Date().toISOString();

  var purchase = {
    id: purchaseId,
    title: title,
    price: price,
    date: now,
    userEmail: userEmail,
    githubUrl: productInfo.githubUrl || '',
    description: productInfo.description || ''
  };

  var currentBalance = getCurrentUserBalance();
  if (currentBalance < price) {
    return false;
  }

  var purchases = getPurchases();
  purchases.push(purchase);
  savePurchases(purchases);

  setCurrentUserBalance(currentBalance - price);

  var newSpending = getTotalSpending() + price;
  setTotalSpending(newSpending);

  addPurchaseToUserAccount(userEmail, purchase, price);

  var newOrder = {
    id: orderId,
    clientName: userName,
    serviceType: title,
    status: 'Chờ xử lý',
    price: price
  };

  var orders = getOrders();
  orders.push(newOrder);
  saveOrders(orders);

  return true;
}

function getCurrentUserBalance() {
  var user = getCurrentUser();
  if (!user || !user.balance) {
    return 0;
  }
  return parseInt(user.balance, 10);
}

function setCurrentUserBalance(newBalance) {
  var users = getUsers();
  var currentUser = getCurrentUser();
  var i;

  if (currentUser) {
    currentUser.balance = newBalance;
    localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(currentUser));
  }

  for (i = 0; i < users.length; i++) {
    if (currentUser && users[i].email.toLowerCase() === currentUser.email.toLowerCase()) {
      users[i].balance = newBalance;
      break;
    }
  }

  saveUsers(users);
}

function closePurchaseConfirmModal() {
  var modal = document.getElementById('purchaseConfirmModal');
  if (modal) {
    modal.classList.remove('show');
  }
}

function openPurchaseConfirmModal(productInfo) {
  var modal = document.getElementById('purchaseConfirmModal');
  var titleEl = document.getElementById('purchaseConfirmTitle');
  var textEl = document.getElementById('purchaseConfirmText');
  var actionsEl = document.getElementById('purchaseConfirmActions');
  var okBtn = document.getElementById('purchaseConfirmOkBtn');
  var cancelBtn = document.getElementById('purchaseConfirmCancelBtn');
  var balance = getCurrentUserBalance();
  var shouldRefreshOnClose = false;

  if (!modal || !titleEl || !textEl || !actionsEl || !okBtn || !cancelBtn) {
    return;
  }

  titleEl.textContent = 'Xác nhận mua hàng nha! 💕';
  textEl.textContent = 'Bạn đang chọn "' + productInfo.title + '" với giá ' + formatCurrency(productInfo.price) + '.';
  actionsEl.style.display = 'flex';
  okBtn.style.display = 'inline-block';
  cancelBtn.style.display = 'inline-block';
  okBtn.textContent = 'Xác nhận mua ❤️';
  cancelBtn.textContent = 'Hủy bỏ';

  if (!isUserLoggedIn()) {
    localStorage.setItem(STORAGE_REDIRECT, getRedirectPageName());
    alert('Vui lòng đăng nhập để mua sản phẩm!');
    window.location.href = 'login.html';
    return;
  }

  if (balance < productInfo.price) {
    titleEl.textContent = 'Ví tiền chưa đủ rồi nè ☁️';
    textEl.textContent = 'Số dư ví không đủ rồi nè! Hãy nạp thêm tiền nhé ☁️';
    okBtn.style.display = 'none';
    cancelBtn.textContent = 'Đóng';
  } else {
    okBtn.onclick = function () {
      var success = processPurchase(productInfo);
      if (success) {
        titleEl.textContent = 'Mua thành công rồi nha! 🥰💖';
        textEl.textContent = 'Cảm ơn bạn rất nhiều! Đơn hàng của bạn đã được gửi tới Ban Quản Trị. ❤️ ☁️ 💕';
        okBtn.style.display = 'none';
        cancelBtn.textContent = 'Đóng';
        shouldRefreshOnClose = true;
      } else {
        titleEl.textContent = 'Ví tiền chưa đủ rồi nè ☁️';
        textEl.textContent = 'Số dư ví không đủ rồi nè! Hãy nạp thêm tiền nhé ☁️';
        okBtn.style.display = 'none';
        cancelBtn.textContent = 'Đóng';
      }
    };
  }

  cancelBtn.onclick = function () {
    closePurchaseConfirmModal();
    if (shouldRefreshOnClose) {
      window.location.reload();
    }
  };

  modal.classList.add('show');
}

function initServicesPage() {
  var productGrid = document.getElementById('productGrid');
  if (!productGrid) return;

  renderCustomProductsOnGrid(productGrid);

  var searchInput = document.getElementById('productSearch');
  var freeToggle = document.getElementById('freeToggle');
  var noResults = document.getElementById('noResults');
  var paginationNav = document.getElementById('paginationNav');
  var paginationItems = paginationNav.querySelectorAll('.pagination-item');
  var currentPage = 1;
  var itemsPerPage = 3;
  var productCols = productGrid.querySelectorAll('.product-col');

  function refreshProductCols() {
    productCols = productGrid.querySelectorAll('.product-col');
  }

  function getFilteredProducts() {
    refreshProductCols();
    var keyword = searchInput.value.toLowerCase().trim();
    var freeOnly = freeToggle.checked;
    var matched = [];

    productCols.forEach(function (col) {
      var title = col.getAttribute('data-title').toLowerCase();
      var tags = col.getAttribute('data-tags').toLowerCase();
      var isFree = col.getAttribute('data-free') === 'true';
      var matchKeyword = keyword === '' || title.indexOf(keyword) !== -1 || tags.indexOf(keyword) !== -1;
      var matchFree = !freeOnly || isFree;

      if (matchKeyword && matchFree) {
        matched.push(col);
      }
    });

    return matched;
  }

  function renderProducts() {
    var matched = getFilteredProducts();
    var totalPages = Math.ceil(matched.length / itemsPerPage);
    if (totalPages === 0) {
      totalPages = 1;
    }
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    var startIndex = (currentPage - 1) * itemsPerPage;
    var endIndex = startIndex + itemsPerPage;

    productCols.forEach(function (col) {
      col.classList.add('product-hidden');
    });

    matched.forEach(function (col, index) {
      if (index >= startIndex && index < endIndex) {
        col.classList.remove('product-hidden');
      }
    });

    if (matched.length === 0) {
      noResults.style.display = 'block';
    } else {
      noResults.style.display = 'none';
    }

    updatePaginationActive();
  }

  function updatePaginationActive() {
    paginationItems.forEach(function (item) {
      var page = item.getAttribute('data-page');
      item.classList.remove('active');
      if (page === String(currentPage)) {
        item.classList.add('active');
      }
    });
  }

  searchInput.addEventListener('input', function () {
    currentPage = 1;
    renderProducts();
  });

  freeToggle.addEventListener('change', function () {
    currentPage = 1;
    renderProducts();
  });

  paginationItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var page = item.getAttribute('data-page');

      if (page === 'prev') {
        if (currentPage > 1) {
          currentPage = currentPage - 1;
        }
      } else if (page === 'next') {
        if (currentPage < 15) {
          currentPage = currentPage + 1;
        }
      } else {
        currentPage = parseInt(page, 10);
      }

      renderProducts();
    });
  });

  productGrid.addEventListener('click', function (event) {
    var button = event.target.closest('.btn-product');
    if (button) {
      handleProductButtonClick(button);
    }
  });

  renderProducts();
}

function initUserDashboard() {
  var dashboardPage = document.getElementById('userDashboardPage');
  if (!dashboardPage) {
    return;
  }

  if (!isUserLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  var profileName = document.getElementById('profileName');
  var profileEmail = document.getElementById('profileEmail');
  var totalSpendingDisplay = document.getElementById('totalSpendingDisplay');
  var walletBalanceDisplay = document.getElementById('walletBalanceDisplay');
  var depositRequestForm = document.getElementById('depositRequestForm');
  var purchaseHistoryBody = document.getElementById('purchaseHistoryBody');
  var passwordForm = document.getElementById('passwordForm');
  var logoutBtn = document.getElementById('userLogoutBtn');
  var codeInfoModal = document.getElementById('codeInfoModal');
  var codeInfoCloseBtn = document.getElementById('codeInfoCloseBtn');
  var codeInfoProductName = document.getElementById('codeInfoProductName');
  var codeInfoPrice = document.getElementById('codeInfoPrice');
  var codeInfoDescription = document.getElementById('codeInfoDescription');
  var codeInfoGithubLink = document.getElementById('codeInfoGithubLink');

  if (profileName) {
    profileName.textContent = getUserName();
  }
  if (profileEmail) {
    profileEmail.textContent = getUserEmail();
  }

  renderUserSpending();
  renderWalletBalance();
  renderPurchaseHistory();

  if (passwordForm) {
    passwordForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var oldPassword = document.getElementById('oldPassword').value;
      var newPassword = document.getElementById('newPassword').value;
      var confirmNewPassword = document.getElementById('confirmNewPassword').value;

      if (oldPassword !== getUserPassword()) {
        showFormAlert(passwordForm, 'Mật khẩu cũ không đúng.', 'danger');
        return;
      }

      if (newPassword !== confirmNewPassword) {
        showFormAlert(passwordForm, 'Mật khẩu mới không khớp.', 'danger');
        return;
      }

      updateUserPassword(getUserEmail(), newPassword);
      showFormAlert(passwordForm, 'Cập nhật mật khẩu thành công!', 'success');
      passwordForm.reset();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      clearCurrentUser();
      window.location.href = 'index.html';
    });
  }

  if (depositRequestForm) {
    depositRequestForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var amount = parseInt(document.getElementById('depositAmountInput').value, 10);
      var transactionCode = document.getElementById('depositTransactionCodeInput').value.trim();
      var requestId = 'deposit_' + Date.now();
      var requests = getDepositRequests();

      requests.push({
        id: requestId,
        clientName: getUserName(),
        clientEmail: getUserEmail(),
        amount: amount,
        transactionCode: transactionCode,
        status: 'Chờ duyệt'
      });

      saveDepositRequests(requests);
      showFormAlert(depositRequestForm, 'Gửi yêu cầu nạp tiền thành công! Bạn chờ Ban Quản Trị duyệt nhé 💕', 'success');
      depositRequestForm.reset();
    });
  }

  function renderUserSpending() {
    if (totalSpendingDisplay) {
      totalSpendingDisplay.textContent = formatCurrency(getTotalSpending());
    }
  }

  function renderWalletBalance() {
    if (!walletBalanceDisplay) {
      return;
    }
    walletBalanceDisplay.textContent = formatCurrency(getCurrentUserBalance());
  }

  function renderPurchaseHistory() {
    if (!purchaseHistoryBody) {
      return;
    }

    var purchases = getPurchases();
    purchaseHistoryBody.innerHTML = '';

    if (purchases.length === 0) {
      var emptyRow = document.createElement('tr');
      emptyRow.innerHTML = '<td colspan="5" class="text-center empty-history">Chưa có sản phẩm nào được mua.</td>';
      purchaseHistoryBody.appendChild(emptyRow);
      return;
    }

    var reversed = purchases.slice().reverse();

    reversed.forEach(function (purchase) {
      var row = document.createElement('tr');
      row.innerHTML =
        '<td data-label="Sản phẩm">' + purchase.title + '</td>' +
        '<td data-label="Giá">' + formatCurrency(purchase.price) + '</td>' +
        '<td data-label="Ngày mua">' + formatDate(purchase.date) + '</td>' +
        '<td data-label="Trạng thái"><span class="status-badge status-completed">Đã mua</span></td>' +
        '<td data-label="Thông tin code"><button type="button" class="btn btn-action btn-action-view code-info-btn" data-title="' + purchase.title + '" data-price="' + purchase.price + '" data-description="' + (purchase.description || '') + '" data-github-url="' + (purchase.githubUrl || '') + '">Xem thông tin</button></td>';
      purchaseHistoryBody.appendChild(row);
    });
  }

  if (purchaseHistoryBody) {
    purchaseHistoryBody.addEventListener('click', function (event) {
      var infoButton = event.target.closest('.code-info-btn');
      if (!infoButton) {
        return;
      }

      if (codeInfoProductName) {
        codeInfoProductName.textContent = infoButton.getAttribute('data-title');
      }
      if (codeInfoPrice) {
        codeInfoPrice.textContent = formatCurrency(parseInt(infoButton.getAttribute('data-price'), 10));
      }
      if (codeInfoDescription) {
        if (infoButton.getAttribute('data-description')) {
          codeInfoDescription.textContent = infoButton.getAttribute('data-description');
        } else {
          codeInfoDescription.textContent = 'Chưa có mô tả cho sản phẩm này.';
        }
      }
      if (codeInfoGithubLink) {
        var githubUrl = infoButton.getAttribute('data-github-url');
        if (githubUrl) {
          codeInfoGithubLink.href = githubUrl;
          codeInfoGithubLink.textContent = 'Xem mã nguồn GitHub';
          codeInfoGithubLink.style.pointerEvents = 'auto';
          codeInfoGithubLink.style.opacity = '1';
        } else {
          codeInfoGithubLink.href = '#';
          codeInfoGithubLink.textContent = 'Chưa có link GitHub';
          codeInfoGithubLink.style.pointerEvents = 'none';
          codeInfoGithubLink.style.opacity = '0.6';
        }
      }

      if (codeInfoModal) {
        codeInfoModal.classList.add('show');
      }
    });
  }

  if (codeInfoCloseBtn) {
    codeInfoCloseBtn.addEventListener('click', function () {
      if (codeInfoModal) {
        codeInfoModal.classList.remove('show');
      }
    });
  }

  if (codeInfoModal) {
    codeInfoModal.addEventListener('click', function (event) {
      if (event.target === codeInfoModal) {
        codeInfoModal.classList.remove('show');
      }
    });
  }
}

function showFormAlert(form, message, type) {
  var existingAlert = form.querySelector('.form-alert');
  if (existingAlert) {
    existingAlert.remove();
  }

  var alertElement = document.createElement('div');
  alertElement.className = 'alert alert-' + type + ' form-alert mt-3';
  alertElement.textContent = message;
  form.appendChild(alertElement);
}