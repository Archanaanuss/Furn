
  function addToCart(productId) {
    $.ajax({
      url: '/addtocart?id=' + productId,
      method: 'GET',
      success: function (response) {
        if (response.status) {
          Swal.fire({
            position: 'centre',
            icon: 'success',
            title: 'Product is added to the cart',
            showConfirmButton: false,
            timer: 1500,
          });
          let count = $('#cart-count').html();
          count = parseInt(count) + 1;
          $('#cart-count').html(count);
        }else{
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Please LOGIN',
            showConfirmButton: false,
            timer: 1500
          })
        let count=$('#wish-count').html()
        count = parseInt(count)-1
        $("#wish-count").html(count)
        }
      },
    });
  }
  
  function addToWishlist(productId){
    $.ajax({
        url:'/add-to-wishlist?id='+productId,
        method:'get',
        success:(response)=>{
            if(response.status){
                Swal.fire({
                    position: 'centre',
                    icon: 'success',
                    title: 'Success',
                    showConfirmButton: false,
                    timer: 1500
                  })
                let count=$('#wish-count').html()
                count = parseInt(count)+1
                $("#wish-count").html(count)
            }else{
              Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Please LOGIN',
                showConfirmButton: false,
                timer: 1500
              })
            let count=$('#wish-count').html()
            count = parseInt(count)-1
            $("#wish-count").html(count)
            }
        }
    })
  }