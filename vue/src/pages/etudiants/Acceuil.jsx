import { useNavigate } from 'react-router-dom';


function AcceuilStudent() {
    const navigate = useNavigate();
    return (
        <div>
            <button onClick={() => navigate('/login')}>Connexion</button>
        </div>
    );
}
  
export default AcceuilStudent;