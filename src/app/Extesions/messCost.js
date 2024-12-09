const messages = {
    // Message validator
    validation: {
        notEmpty: (fieldName) => `${fieldName} không được để trống.`,
        notNull: (fieldName) => `${fieldName} không được là null.`,
        greaterThan: (fieldName, minValue) => `${fieldName} phải lớn hơn ${minValue}.`,
        maxLength: (fieldName, maxLength) => `${fieldName} không được dài hơn ${maxLength} ký tự.`,
        invalidEmail: 'Email không hợp lệ.',
        invalidPhoneNumber: 'Số điện thoại không hợp lệ.',
        invalidDate: (fieldName) => `${fieldName} không hợp lệ.`,
        maxFileSize: (fieldName, maxSizeMB) => `${fieldName} không được vượt quá ${maxSizeMB}MB.`,
        invalidEnum: (fieldName) => `${fieldName} không hợp lệ.`,
        invalidFileType: (fieldName, allowedTypes) => `${fieldName} chỉ chấp nhận các định dạng: ${allowedTypes}.`,
        requiredField: (fieldName) => `${fieldName} không tồn tại.`,
        arrayNotEmpty: (fieldName) => `${fieldName} không được để trống`,
        isPositiveNumber: (fieldName) => `${fieldName} phải là một số dương`,
        containsVietnamese: 'Chuỗi không được chứa ký tự tiếng Việt.',
        invalidUrl: (fieldName) => `${fieldName} không phải là một URL nhúng YouTube hợp lệ.`,
        invalidDurationFormat: (fieldName) => `${fieldName} phải có định dạng hh:mm:ss.`,
        invalidDurationValue: (fieldName) => `${fieldName} phải lớn hơn 0.`,
        equals: (fieldName) => `${fieldName} không khớp với nhau.`
    },

    // Message Token 
    token: {
        tokenVerificationFailed: 'Token verification failed.',
        tokenVerificationSucces: 'Token verification success.',
        tokenNotFound: 'Admin not found.',
        tokenFetchingError: 'Error fetching data.'
    },

    //Message session
    session: {
        sessionDestroyFailed: 'Failed to destroy session during logout.',
        sessionDestroySucces: 'Logged out successfully.',
    },
    
    // Message login
    login: {    
        usernameRequired: 'Tên đăng nhập là bắt buộc.',
        passwordRequired: 'Mật khẩu là bắt buộc.',
        invalidCredentials: 'Tên đăng nhập hoặc mật khẩu không đúng.',
        usernameNotFound: 'Tài khoản không tồn tại',
        usernamesoftDelete: 'Tài khoản đã bị vô hiệu hoá',
        passwordCompaseFailed: 'Mật khẩu không chính xác',
        usernameNotRole: 'Tài khoản không có quyền truy cập',
        usernameAdminRole: 'Tài khoản này là tài khoản admin',
        loginError: 'Lỗi khi xử lý đăng nhập.'
    },

    // Message Create user
    createUser: {
        accountAdminExist: 'Tài khoản admin đã tồn tại.',
        accountCreateSuccess:'Tài khoản admin đã được tạo.',
        accountCreateError: 'Lỗi khi kiểm tra hoặc tạo tài khoản admin.',
        avartarRequried: 'Ảnh đại diện là bắt buộc.',
        accountExist: 'Tài khoản đã tồn tại.',
        RegisterErorr: 'Lỗi khi xử lý đăng ký.',
    },

    // Message Delete user 
    deleteUser: {
        softDeleteError: 'Không thể xóa người dùng.',
        softDeleteSucces: 'Người dùng đã được vô hiệu hóa!',
    },

    //Message Update user
    updateUser: {
        changePasswordDecrypt:'Mật khẩu không chính xác.',
        changePasswordError: 'Lỗi khi xử lý thay đổi mật khẩu.',
        userNotFound: "Người dùng không tồn tại.",
        updateError: "Lỗi khi cập nhật người dùng.",
        updateSuccess: "Người dùng đã được cập nhật thành công.",
        notFound: 'tài khoản không tồn tại'
    },

    //Message GET user
    getAllUser: {
        getAllUserError: 'Lỗi khi lấy danh sách tài khoản.',
    },

    //Message Restore user 
    restoreUser: {
        restoreError: "Lỗi khi khôi phục người dùng.",
        restoreSuccess: "Người dùng đã được khôi phục thành công."
    },

    //Message Delete user
    deleteUser: {
        softDeleteError: "Không thể vô hiệu hóa người dùng.",
        softDeleteSuccess: "Đã vô hiệu hóa người dùng thành công.",
        deleteError: "Không thể xóa người dùng.",
        deleteSuccess: "Đã xóa người dùng thành công."
    },

    //Message Create Course
    createCourse: {
        courseExist: 'Khóa học đã tồn tài.',
    },

    //Message Update Course
    updateCourse: {
        courseExist: 'Khóa học đã tồn tài.',
        courseNotFound: "Khóa học không tồn tại.",
        updateError: "Lỗi khi cập nhật Khóa học.",
        updateSuccess: "Khóa học đã được cập nhật thành công.",
    },

    //Message Create chapters 
    createChapter: {
        chapterExist: 'chapter đã tồn tại.'
    },

    //Message Update chapters 
    updateChapter: {
        chapterExist: 'chapter đã tồn tại.'
    },

    // Message Delete Chapter
    deleteChapter: {
        chapterNotFound: "Không tìm thấy chương học.",
        softDeleteSuccess: "Vô hiệu hóa chương học thành công.",
        softDeleteError: "Lỗi khi vô hiệu hóa chương học.",
        deleteSuccess: "Xóa chương học thành công.",
        deleteError: "Lỗi khi xóa chương học."
    },

    restoreChapter: {
        chapterNotFound: "Không tìm thấy chương học.",
        restoreSuccess: "Khôi phục chương học thành công.",
        restoreError: "Lỗi khi khôi phục chương học.",
        courseDisabled: "Không thể khôi phục chương học vì khóa học đang bị vô hiệu hóa. Vui lòng khôi phục khóa học trước."
    },

    //Message Create lesson 
    createLesson: {
        lessonExist: 'lesson đã tồn tại.'
    },

    // Message Delete lesson
    deleteLesson: {
        lessonNotFound: "Không tìm thấy bài học.",
        softDeleteSuccess: "Vô hiệu hóa bài học thành công.",
        softDeleteError: "Lỗi khi vô hiệu hóa bài học.",
        deleteSuccess: "Xóa bài học thành công.",
        deleteError: "Lỗi khi xóa bài học."
    },

    restoreLesson: {
        lessonNotFound: "Bài học không tồn tại.",
        chapterDisabled: "Không thể khôi phục bài học vì chương đang bị vô hiệu hóa. Vui lòng khôi phục chương trước.",
        restoreSuccess: "Khôi phục bài học thành công.",
        restoreError: "Lỗi khi khôi phục bài học.",
    },

    //Message Update lesson
    updateLesson: {
        lessonExist: 'Bài học đã tồn tài.',
        lessonNotFound: "Bài học không tồn tại.",
        updateError: "Lỗi khi cập nhật Bài học.",
        updateSuccess: "Bài học đã được cập nhật thành công.",
    },
};

module.exports = messages;
