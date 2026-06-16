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
  initServicesPage();
  initUserDashboard();
});

var STORAGE_LOGGED_IN = 'drgifter_logged_in';
var STORAGE_REDIRECT = 'drgifter_redirect_after_login';
var STORAGE_USERS = 'users';
var STORAGE_CURRENT_USER = 'currentUser';
var STORAGE_SPENDING = 'drgifter_total_spending';
var STORAGE_PURCHASES = 'drgifter_purchases';
var STORAGE_ADMIN_ORDERS = 'drgifter_admin_orders';
var STORAGE_USER_LOGIN_FAILURES = 'drgifter_user_login_failures';
var STORAGE_USER_LOGIN_LOCKED = 'drgifter_user_login_locked';
var STORAGE_ADMIN_LOGIN_FAILURES = 'drgifter_admin_login_failures';
var STORAGE_ADMIN_LOGIN_LOCKED = 'drgifter_admin_login_locked';
var STORAGE_CUSTOM_PRODUCTS = 'customProducts';
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
    email: user.email
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

function getDefaultAdminOrders() {
  return [
    { id: 'seed1', clientName: 'Nguyễn Thành', serviceType: 'Phát triển Web', status: 'pending', price: 0 },
    { id: 'seed2', clientName: 'Lê Hương', serviceType: 'Quà tặng', status: 'progress', price: 0 },
    { id: 'seed3', clientName: 'Trần Minh', serviceType: 'Hỗ trợ bài tập', status: 'completed', price: 0 },
    { id: 'seed4', clientName: 'Phạm Anh', serviceType: 'Phát triển Web', status: 'pending', price: 0 },
    { id: 'seed5', clientName: 'Đỗ Linh', serviceType: 'Quà tặng', status: 'progress', price: 0 }
  ];
}

function getAdminOrders() {
  var data = localStorage.getItem(STORAGE_ADMIN_ORDERS);
  if (!data) {
    var defaults = getDefaultAdminOrders();
    localStorage.setItem(STORAGE_ADMIN_ORDERS, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(data);
}

function saveAdminOrders(orders) {
  localStorage.setItem(STORAGE_ADMIN_ORDERS, JSON.stringify(orders));
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
  var userNavItem = document.getElementById('userNavItem');
  var loginNavItem = document.getElementById('loginNavItem');
  var userNavName = document.getElementById('userNavName');

  if (!userNavItem && !loginNavItem) {
    return;
  }

  if (isUserLoggedIn()) {
    if (userNavItem) {
      userNavItem.style.display = 'block';
    }
    if (loginNavItem) {
      loginNavItem.style.display = 'none';
    }
    if (userNavName) {
      userNavName.textContent = getUserName();
    }
  } else {
    if (userNavItem) {
      userNavItem.style.display = 'none';
    }
    if (loginNavItem) {
      loginNavItem.style.display = 'block';
    }
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
      password: password
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
    products: 'Quản lý sản phẩm'
  };

  renderAdminDashboard();
  renderUsersTable();
  initProductManagement();

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
        updateAdminOrderStatus(orderId, 'completed');
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
  var orders = getAdminOrders();
  var tableBody = document.getElementById('requestsTableBody');
  var totalOrdersEl = document.getElementById('totalOrdersMetric');
  var revenueEl = document.getElementById('revenueMetric');
  var activeUsersEl = document.getElementById('activeUsersMetric');

  if (!tableBody) {
    return;
  }

  var baseOrders = 89;
  var baseRevenue = 12500000;
  var purchaseRevenue = 0;
  var purchaseCount = 0;

  orders.forEach(function (order) {
    if (order.id.indexOf('seed') !== 0) {
      purchaseCount = purchaseCount + 1;
      purchaseRevenue = purchaseRevenue + order.price;
    }
  });

  var totalOrders = baseOrders + purchaseCount;
  var totalRevenue = baseRevenue + purchaseRevenue;

  if (totalOrdersEl) {
    totalOrdersEl.textContent = String(totalOrders);
  }
  if (revenueEl) {
    revenueEl.textContent = formatCurrency(totalRevenue);
  }
  if (activeUsersEl) {
    activeUsersEl.textContent = String(24 + purchaseCount);
  }

  tableBody.innerHTML = '';

  var sortedOrders = orders.slice().reverse();

  sortedOrders.forEach(function (order) {
    var statusClass = 'status-pending';
    var statusText = 'Chờ xử lý';

    if (order.status === 'progress') {
      statusClass = 'status-progress';
      statusText = 'Đang xử lý';
    }
    if (order.status === 'completed') {
      statusClass = 'status-completed';
      statusText = 'Hoàn thành';
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

  col.innerHTML =
    '<article class="product-card">' +
      '<div class="product-preview ' + previewClass + '">' +
        '<i class="bi bi-stars"></i>' +
      '</div>' +
      '<h2 class="product-title">' + product.name + '</h2>' +
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
  var action = button.getAttribute('data-action');

  if (action === 'video') {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    } else {
      alert('Chưa có đường dẫn video cho sản phẩm này.');
    }
  }

  if (action === 'buy') {
    var success = processPurchase(title, price);
    if (success) {
      showPurchaseModal();
    }
  }

  if (action === 'demo') {
    if (demoUrl) {
      window.open(demoUrl, '_blank');
    } else {
      alert('Chưa có đường dẫn demo cho sản phẩm này.');
    }
  }
}

function processPurchase(title, price) {
  if (!isUserLoggedIn()) {
    localStorage.setItem(STORAGE_REDIRECT, 'services');
    window.location.href = 'login.html';
    return false;
  }

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
    userEmail: userEmail
  };

  var purchases = getPurchases();
  purchases.push(purchase);
  savePurchases(purchases);

  var newSpending = getTotalSpending() + price;
  setTotalSpending(newSpending);

  var adminOrder = {
    id: orderId,
    clientName: userName,
    serviceType: title,
    status: 'pending',
    price: price
  };

  var adminOrders = getAdminOrders();
  adminOrders.push(adminOrder);
  saveAdminOrders(adminOrders);

  return true;
}

function showPurchaseModal() {
  var modal = document.getElementById('purchaseModal');
  if (modal) {
    modal.classList.add('show');
  }
}

function hidePurchaseModal() {
  var modal = document.getElementById('purchaseModal');
  if (modal) {
    modal.classList.remove('show');
  }
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
  var modalCloseBtn = document.getElementById('purchaseModalClose');
  var purchaseModal = document.getElementById('purchaseModal');

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', hidePurchaseModal);
  }

  if (purchaseModal) {
    purchaseModal.addEventListener('click', function (event) {
      if (event.target === purchaseModal) {
        hidePurchaseModal();
      }
    });
  }

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
  var purchaseHistoryBody = document.getElementById('purchaseHistoryBody');
  var passwordForm = document.getElementById('passwordForm');
  var logoutBtn = document.getElementById('userLogoutBtn');

  if (profileName) {
    profileName.textContent = getUserName();
  }
  if (profileEmail) {
    profileEmail.textContent = getUserEmail();
  }

  renderUserSpending();
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

  function renderUserSpending() {
    if (totalSpendingDisplay) {
      totalSpendingDisplay.textContent = formatCurrency(getTotalSpending());
    }
  }

  function renderPurchaseHistory() {
    if (!purchaseHistoryBody) {
      return;
    }

    var purchases = getPurchases();
    purchaseHistoryBody.innerHTML = '';

    if (purchases.length === 0) {
      var emptyRow = document.createElement('tr');
      emptyRow.innerHTML = '<td colspan="4" class="text-center empty-history">Chưa có sản phẩm nào được mua.</td>';
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
        '<td data-label="Trạng thái"><span class="status-badge status-completed">Đã mua</span></td>';
      purchaseHistoryBody.appendChild(row);
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
function loadRegisteredUsers() {
  const tableBody = document.getElementById("userTableBody");
  if (!tableBody) return;
  const users = JSON.parse(localStorage.getItem("users")) || [];
  tableBody.innerHTML = "";
  if (users.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='3' class='text-center py-4 text-muted'>Chưa có thành viên nào đăng ký</td></tr>";
      return;
  }
  users.forEach(user => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td class="align-middle">${user.name}</td>
          <td class="align-middle">${user.email}</td>
          <td class="align-middle"><span class="badge bg-white text-danger border border-1 card-accent px-3 py-2 rounded-pill">Hoạt động</span></td>
      `;
      tableBody.appendChild(row);
  });
}
document.addEventListener("DOMContentLoaded", loadRegisteredUsers);