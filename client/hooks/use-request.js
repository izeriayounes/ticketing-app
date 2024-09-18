import axios from 'axios';
import { useState } from 'react';

export default function ({ url, method, body, onSuccess }) {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try {
      setErrors(null);
      console.log(url, method);

      const res = await axios[method](url, body);

      onSuccess();
      return res.data;
    } catch (err) {
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooooops...</h4>
          <ul className="my-0">
            {err.response.data.errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
}
