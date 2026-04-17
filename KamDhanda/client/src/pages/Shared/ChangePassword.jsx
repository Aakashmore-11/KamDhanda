import React, { useState } from "react";
import { LockKeyhole, Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { serverObj } from "../../config/serverConfig";
import { handleErrorMsg, handleSuccessMsg } from "../../config/toast";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

  .kd-root-pw {
    min-height: 100vh; background: #07070d;
    display: flex; align-items: center; justify-content: center;
    padding: 2rem 1rem; font-family: 'DM Sans', sans-serif;
    position: relative; overflow: hidden;
  }
  .kd-grid-pw {
    position: fixed; inset: 0; pointer-events: none;
    background-image: linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
    background-size: 52px 52px;
  }
  .kd-orb-pw { position: fixed; border-radius: 50%; pointer-events: none; }
  .kd-o1-pw { width: 600px; height: 600px; background: radial-gradient(circle, rgba(88,40,255,0.15) 0%, transparent 65%); top: -200px; right: -150px; }
  .kd-o2-pw { width: 400px; height: 400px; background: radial-gradient(circle, rgba(40,200,180,0.08) 0%, transparent 65%); bottom: -100px; left: -100px; }

  .kd-card-pw {
    position: relative; z-index: 1; width: 100%; max-width: 480px;
    background: #0d0d16; padding: 2.5rem 2rem;
    border-radius: 24px; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 0 0 1px rgba(88,40,255,0.1), 0 40px 120px rgba(0,0,0,0.8);
  }
  .kd-card-pw::before {
    content:''; position: absolute; top:0; left:0; right:0; height:1px;
    background: linear-gradient(90deg, transparent, rgba(88,40,255,0.4), transparent);
  }

  .kd-back-link {
    display: inline-flex; align-items: center; gap: 6px;
    color: rgba(255,255,255,0.4); text-decoration: none;
    font-size: 0.8rem; font-weight: 500; margin-bottom: 2rem;
    transition: color 0.2s;
  }
  .kd-back-link:hover { color: #fff; }

  .kd-ftitle-pw { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: #fff; letter-spacing: -0.04em; margin-bottom: 6px; }
  .kd-fsub-pw { font-size: 0.85rem; color: rgba(255,255,255,0.32); font-weight: 300; margin-bottom: 2rem; line-height: 1.6; }

  .kd-field-pw { margin-bottom: 1.25rem; }
  .kd-lbl-pw { font-size: 0.68rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.35); margin-bottom: 6px; display: block; }
  .kd-iw-pw { position: relative; }
  .kd-ico-pw { position: absolute; top: 50%; left: 14px; transform: translateY(-50%); color: rgba(255,255,255,0.2); display: flex; pointer-events: none; }
  .kd-input-pw {
    width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 12px 14px 12px 40px;
    font-size: 0.88rem; font-family: 'DM Sans', sans-serif; color: #fff;
    outline: none; -webkit-appearance: none;
    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
  }
  .kd-input-pw::placeholder { color: rgba(255,255,255,0.15); }
  .kd-input-pw:focus { border-color: rgba(88,40,255,0.55); background: rgba(88,40,255,0.05); box-shadow: 0 0 0 3px rgba(88,40,255,0.1); }
  .kd-err-pw { font-size: 0.74rem; color: #f87171; margin-top: 5px; }

  .kd-btn-pw {
    width: 100%; padding: 14px; border-radius: 14px; border: none; cursor: pointer;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.95rem;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: linear-gradient(135deg, #5828ff, #8b5cf6); color: #fff; letter-spacing: 0.01em;
    position: relative; overflow: hidden;
    box-shadow: 0 4px 20px rgba(88,40,255,0.35);
    transition: opacity 0.2s, transform 0.12s, box-shadow 0.2s;
    margin-top: 0.5rem;
  }
  .kd-btn-pw::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent); pointer-events: none; }
  .kd-btn-pw:hover { opacity: 0.9; box-shadow: 0 6px 28px rgba(88,40,255,0.5); }
  .kd-btn-pw:active { transform: scale(0.98); }
  .kd-btn-pw:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
`;

const RawInput = React.forwardRef(({ label, icon: Icon, type = "text", placeholder, error, ...rest }, ref) => (
  <div className="kd-field-pw">
    <label className="kd-lbl-pw">{label}</label>
    <div className="kd-iw-pw">
      {Icon && <span className="kd-ico-pw"><Icon size={16} /></span>}
      <input ref={ref} type={type} placeholder={placeholder} className="kd-input-pw" {...rest} />
    </div>
    {error && <p className="kd-err-pw">&#9679; {error}</p>}
  </div>
));
RawInput.displayName = "RawInput";

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const serverAPI = serverObj.serverAPI;

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
  
  const newPassword = watch("newPassword");

  const onSubmit = (data) => {
    setLoading(true);
    axios.patch(
      `${serverAPI}/user/change-password`,
      {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      },
      { withCredentials: true }
    )
      .then((res) => {
        handleSuccessMsg(res.data.message);
        reset();
      })
      .catch((err) => {
        handleErrorMsg(err?.response?.data?.message || "Failed to update password!");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="kd-root-pw">
        <div className="kd-grid-pw" />
        <div className="kd-orb-pw kd-o1-pw" />
        <div className="kd-orb-pw kd-o2-pw" />

        <div className="kd-card-pw">
          <Link to={-1} className="kd-back-link">
            <ArrowLeft size={14} /> Back
          </Link>
          
          <h1 className="kd-ftitle-pw">Change Password</h1>
          <p className="kd-fsub-pw">Keep your KamDhanda account secure by updating your credentials.</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <RawInput
              label="Old Password"
              type="password"
              icon={LockKeyhole}
              placeholder="••••••••"
              error={errors.oldPassword?.message}
              {...register("oldPassword", { required: "Your current password is required" })}
            />

            <RawInput
              label="New Password"
              type="password"
              icon={LockKeyhole}
              placeholder="••••••••"
              error={errors.newPassword?.message}
              {...register("newPassword", {
                required: "A new password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })}
            />

            <RawInput
              label="Confirm New Password"
              type="password"
              icon={LockKeyhole}
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                required: "Please confirm your new password",
                validate: (value) => value === newPassword || "Passwords do not match"
              })}
            />

            <button type="submit" disabled={loading} className="kd-btn-pw">
              {loading ? <><Loader2 className="animate-spin" size={16} /> Updating...</> : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
