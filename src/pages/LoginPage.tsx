import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../auth/UserAuthContext";
import CommunityTopBar from "../components/CommunityTopBar";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useUserAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "로그인";
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !password.trim()) {
      setErrorMessage("아이디와 비밀번호를 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await login({ username: username.trim(), password });
      navigate("/dongyeon-power-ranking");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "로그인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />
        <section className="signupPanel">
          <div className="signupPanelCopy">
            <p className="powerRankingEyebrow">Membership</p>
            <h1>로그인</h1>
            <p className="powerRankingLead">이 디바이스에서는 refresh cookie 기반으로 로그인 상태가 유지됩니다.</p>
          </div>

          {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}

          <form className="signupForm" onSubmit={submit}>
            <label>
              <span>아이디</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="아이디" />
            </label>
            <label>
              <span>비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호"
              />
            </label>
            <button type="submit" className="powerRankingVoteButton" disabled={submitting}>
              {submitting ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
