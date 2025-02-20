from tortoise import fields
from tortoise.models import Model
from .ProductsModel import ProductsModel
from .ListPermissionsModel import ListPermissionsModel

class ListsModel(Model):
    """
    Lists 的資料庫結構定義
    """
    list_uid = fields.CharField(max_length=36, primary_key=True)
    f_user_id = fields.ForeignKeyField(
        "models.UsersModel", 
        related_name="lists",
        on_delete=fields.CASCADE,
    )
    list_name = fields.CharField(max_length=100)
    description = fields.CharField(max_length=255, null=True)
    created_at = fields.CharField(max_length=25)

    products: fields.ReverseRelation["ProductsModel"]
    permissions: fields.ReverseRelation["ListPermissionsModel"]

    class Meta:
        """
        定義資料表名稱
        """
        table = "lists"
        unique_together = ("f_user_id", "list_uid")