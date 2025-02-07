from tortoise import fields
from tortoise.models import Model

class ProductsModel(Model):
    """
    產品內容
    """
    id = fields.IntField(pk=True)
    f_user_id = fields.ForeignKeyField(
        "models.UsersModel", 
        related_name="products",
        on_delete=fields.CASCADE
    )
    f_list_id = fields.ForeignKeyField(
        "models.ListsModel", 
        related_name="products",
        on_delete=fields.CASCADE,
        to_field="list_uid"
    )
    product_name = fields.CharField(max_length=100)
    product_barcode = fields.CharField(max_length=13)
    product_number = fields.CharField(max_length=36, default=1)
    product_image_url = fields.CharField(max_length=255)
    expiry_date = fields.CharField(max_length=10)
    description = fields.CharField(max_length=255, null=True)

    class Meta:
        """
        定義資料表名稱
        """
        table = "products"
        unique_together = ("f_user_id", "f_list_id", "product_barcode", "expiry_date")
