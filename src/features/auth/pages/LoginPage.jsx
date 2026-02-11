import AuthLayout from '../../../app/layouts/AuthLayout';
import AuthInfoPanel from '../components/AuthInfoPanel';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
    return <AuthLayout left={<AuthInfoPanel />} right={<LoginForm />} />;
}
