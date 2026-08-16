from datetime import timedelta

from app.services.auth_service import (
    create_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_hash_password_produces_different_hash_than_input():
    hashed = hash_password("mysecretpassword")
    assert hashed != "mysecretpassword"


def test_verify_password_accepts_correct_password():
    hashed = hash_password("mysecretpassword")
    assert verify_password("mysecretpassword", hashed) is True


def test_verify_password_rejects_wrong_password():
    hashed = hash_password("mysecretpassword")
    assert verify_password("wrongpassword", hashed) is False


def test_hash_password_uses_random_salt():
    assert hash_password("samepassword") != hash_password("samepassword")


def test_create_and_decode_token_roundtrip():
    token = create_token(data={"sub": "user-123"})
    payload = decode_token(token)
    assert payload["sub"] == "user-123"


def test_decode_token_rejects_garbage_token():
    assert decode_token("not-a-valid-token") is None


def test_decode_token_rejects_expired_token():
    token = create_token(data={"sub": "user-123"}, expires_delta=timedelta(minutes=-1))
    assert decode_token(token) is None
