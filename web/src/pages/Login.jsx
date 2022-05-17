function Login() {
    return (
        <div id='login' className='text-center'>
            <div className='login'>
                <div className='col-md-10 col-md-offset-1 section-title'>
                    <h2>Login</h2>
                </div>
                <div className='row'>
                    <div className="login-wrapper"></div>
                        <form>
                            <label>
                                <p>Username</p>
                                <input type="text" />
                            </label>
                            <label>
                                <p>Password</p>
                                <input type="password" />
                            </label>
                            <div>
                                <button type="submit">Submit</button>
                            </div>
                        </form>
                </div>
            </div>
        </div>
    );
}


export default Login;
