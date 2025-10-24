import { useNavigate } from 'react-router-dom';
import { recupererToken } from '../../services/user';


function AcceuilStudent() {
    const navigate = useNavigate();
    const token = recupererToken();
    return (
        <>
            {token == null && (
                <div>
                    <button onClick={() => navigate('/login')}>Connexion</button>
                </div>
            )}
            {token != null && (
                <div>
                    <button onClick={() => navigate('/compte')}>compte</button>
                </div>
            )}
        </>
    );
}
  
export default AcceuilStudent;