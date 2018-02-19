/* Custom JavaScript File */
/* --------------- */
/* Project Title : JABBER */
/* Team Members : 
    1) Jamal
    2) Jeff
    3) Kalpesh
    4) Peter */
/* Starting Date : 01-03-2018 */
/* Version : 1.0.0 */
/* Copyright reserved 2018 */
/* ----------------------- */

$(document).ready(function() {

	/* Edit Profile Text Fields */
	$('.edit').on('click', function() {

		var currentField = "#" + $(this).attr('id');
		var editField = currentField + "-edit"

		$(currentField).hide();
		$(editField).show();
		$(editField).focus();
		$('#btn-profile-update').show();

		$('#btn-profile-update').on('click', function() {
			$(".edit").each(function() {
				var eachUpdate = "#" + $(this).attr('id') + '-edit'
				$(this).html( $(eachUpdate).val().trim() );
			});

			$(editField).hide();
			$(currentField).show();

			var id = $('#user-image').attr('data-value');

			$.ajax({
				method: "POST",
				data: {
					firstname: $('#user-firstname').text(),
					lastname:  $('#user-lastname').text(),
					email: $('#user-email').text(),
					bio: $('#user-bio').text()
				},
				url: '/users/profile/' + id
			}).done(function(data) {
				location.reload();
			});
		});
	});

	/* Edit User Messages */
	$('.btn-update').on('click', function() {
        /* Toggle buttons to perform Update/Delete */
        var currentValue = $(this).attr('data-value').trim();
        var id = $(this).attr('record-id');
        
        if(currentValue === 'update') {
            $(this).attr('data-value','save');
            $(this).html('<i class="fas fa-save"></i>');
            $('#delete-' + id).html('<i class="fas fa-times-circle"></i>');
            $('#delete-' + id).attr('operation', 'cancel');
            var message = $('#message-' + id).text().trim();
            $('#message-' + id).hide();
            $('#update-message-' + id).show();
            $('#update-message-' + id).focus();
            $('#update-message-' + id).val(message);
        }
        else if(currentValue === 'save') {
            $(this).attr('data-value','update');
            $(this).html('<i class="fas fa-pencil-alt"></i>');
            $('#delete-' + id).html('<i class="fas fa-trash"></i>');
            $('#delete-' + id).attr('operation', 'delete');
            var message = $('#update-message-' + id).val();
            $('#message-' + id).show();
            $('#update-message-' + id).hide();

            $.ajax({
                method: "POST",
                data: {
                    'message': message
                },
                url: "/users/update/" + id
            }).done(function(data) {
                location.reload();
            });
        }
    });

    /* When modal show up, grab the 'data-href' attribute of calling button */
    /* And set it to 'data-id' of 'Delete' button, so that we can grab that id on click event of Delete button */
    $('#exampleModalCenter').on('shown.bs.modal', function(event) {
        var id = $(event.relatedTarget).data('href');
        $('#btn-delete').attr('data-id', id);
    });

    /* This is Modal's Delete button which has 'data-id' attribute containing current post id */
    $('#btn-delete').on('click', function() {
        var id = $(this).attr('data-id');
        $.ajax({
            method: "POST",
            data: {
                'id': id
            },
            url: "/users/delete/" + id
        }).done(function(data) {
            location.reload();
        });
    });

    /* GET News Feed Messages */
	$('#feed-tab').on('click', function() {
		$.get('/users/feed', function(data) {

			$('#feed').empty();
			var print = data;
			for (var i=0; i<print.length; i++) {

				var profilepicture = print[i].User.profilepicture;
                var userid = print[i].User.id;
				var fullname = print[i].User.firstname + " " + print[i].User.lastname;
				var message = print[i].message;
				var time = print[i].createdAt;
				var image = print[i].image;

                /* creating global feed on the fly */
                var media = $("<div class='media'>");
                var profilepicture = $("<a href='/users/profile/" + userid + "'><img class='rounded mr-3 post-picture follow' src='/assets/images/profile/" + profilepicture + "'><a/>");
                var body = $("<div class='media-body'>");
                var h5 = $("<h5 class='mt-0'>" + fullname + "</h5>");
                var msg = $("<span>" + message + "</span><br>");
                var timestamp = $("<small><span>" + moment(time).format('LLL') + "</span></small>");
                var hr = $('<hr>');
                body.append(h5);
                if(image !== null) {
                    var postImage = $('<a href="/assets/images/post/' + image + '" target="_blank">' + '<img src="/assets/images/post/' + image + '" class="img-fluid user-picture">' + '</a><br>');
                    body.append(postImage);
                }
                body.append(msg, timestamp, hr);
                media.append(profilepicture, body);
                $('#feed').append(media);
			}
		});
	});

    /* GET News Feed Messages */
    $('#following-user').on('click', function() {
        var id = $(this).attr('data-value');
        $.get('/users/following', function(data) {
            $('#following').empty();
            for (var i=0; i<data.length; i++) {

                var profilepicture = data[i].followingfk.profilepicture;
                var userid = data[i].followingfk.id;
                var fullname = data[i].followingfk.firstname + " " + data[i].followingfk.lastname;

                /* creating global feed on the fly */
                var media = $("<div class='media'>");
                var profilepicture = $("<a href='/users/profile/" + userid + "'><img class='rounded mr-3 post-picture follow' src='/assets/images/profile/" + profilepicture + "'><a/>");
                var body = $("<div class='media-body'>");
                var h5 = $("<h5 class='mt-0'>" + fullname + "</h5>");
                var unfollow = $("<button class='btn btn-danger btn-sm'>Unfollow</button>");

                var hr = $('<hr><br>');
                body.append(h5, unfollow, hr);
                media.append(profilepicture, body);
                $('#following').append(media);
            }
        });
    });

    /* GET News Feed Messages */
    $('#followers-user').on('click', function() {
        $.get('/users/followers', function(data) {
            $('#follower').empty();
            for (var i=0; i<data.length; i++) {

                var profilepicture = data[i].followersfk.profilepicture;
                var userid = data[i].followersfk.id;
                var fullname = data[i].followersfk.firstname + " " + data[i].followersfk.lastname;

                /* creating global feed on the fly */
                var media = $("<div class='media'>");
                var profilepicture = $("<a href='/users/profile/" + userid + "'><img class='rounded mr-3 post-picture follow' src='/assets/images/profile/" + profilepicture + "'><a/>");
                var body = $("<div class='media-body'>");
                var h5 = $("<h5 class='mt-0'>" + fullname + "</h5>");
                var hr = $('<hr><br>');
                body.append(h5, hr);
                media.append(profilepicture, body);
                $('#follower').append(media);
            }
        });
    });
});