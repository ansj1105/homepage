import { useEffect, useState, type FormEvent } from "react";
import CommunityTopBar from "../components/CommunityTopBar";

type SignupForm = {
  username: string;
  password: string;
  passwordConfirm: string;
  name: string;
  nickname: string;
};

const createInitialForm = (): SignupForm => ({
  username: "",
  password: "",
  passwordConfirm: "",
  name: "",
  nickname: ""
});

const SignupPage = () => {
  const [form, setForm] = useState<SignupForm>(createInitialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    document.title = "회원가입";
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (
      !form.username.trim() ||
      !form.password.trim() ||
      !form.passwordConfirm.trim() ||
      !form.name.trim() ||
      !form.nickname.trim()
    ) {
      setErrorMessage("아이디, 비밀번호, 비밀번호 확인, 이름, 닉네임을 모두 입력해 주세요.");
      return;
    }

    if (form.password.length < 8) {
      setErrorMessage("비밀번호는 8자 이상으로 입력해 주세요.");
      return;
    }

    if (form.password !== form.passwordConfirm) {
      setErrorMessage("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setSuccessMessage("회원가입 폼 입력이 완료되었습니다. 실제 가입 저장 API는 다음 단계에서 연결하면 됩니다.");
  };

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />
        <section className="signupPanel">
          <div className="signupPanelCopy">
            <p className="powerRankingEyebrow">Membership</p>
            <h1>회원가입</h1>
            <p className="powerRankingLead">
              아이디와 비밀번호, 이름, 닉네임을 입력해 회원가입을 진행합니다.
            </p>
          </div>

          {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}
          {successMessage ? <div className="boardSuccess">{successMessage}</div> : null}

          <form className="signupForm" onSubmit={submit}>
            <label>
              <span>아이디</span>
              <input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="아이디"
              />
            </label>
            <label>
              <span>비밀번호</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="비밀번호"
              />
            </label>
            <label>
              <span>비밀번호 확인</span>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={(event) =>
                  setForm((current) => ({ ...current, passwordConfirm: event.target.value }))
                }
                placeholder="비밀번호 확인"
              />
            </label>
            <label>
              <span>이름</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="이름"
              />
            </label>
            <label>
              <span>닉네임</span>
              <input
                value={form.nickname}
                onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))}
                placeholder="닉네임"
              />
            </label>
            <button type="submit" className="powerRankingVoteButton">
              회원가입
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default SignupPage;
