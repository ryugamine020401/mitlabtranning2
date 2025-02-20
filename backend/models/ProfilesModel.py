from tortoise import fields
from tortoise.models import Model

class ProfilesModel(Model):
    """
    Profiles 的資料庫結構定義
    """
    f_user_uid = fields.ForeignKeyField(
        "models.UsersModel",
        related_name="profiles",
        on_delete=fields.CASCADE,
        primary_key=True
    )
    name = fields.CharField(max_length=50, null=True)
    phone_number = fields.CharField(max_length=15, null=True)
    date_of_birth = fields.CharField(max_length=10, null=True)
    address = fields.CharField(max_length=255, null=True)
    profile_picture_url = fields.CharField(max_length=255, null=True)
    bio = fields.CharField(max_length=500, null=True)
    class Meta:
        """
        定義表的名稱
        """
        table="profiles"
