<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class StaffTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_manage_staff()
    {
        $response = $this->get(route('staf.index'));
        $response->assertRedirect(route('login'));

        $responsePost = $this->post(route('staf.store'), [
            'name' => 'Staf Baru',
            'email' => 'staf@toko.com',
            'password' => 'password123',
        ]);
        $responsePost->assertRedirect(route('login'));
    }

    public function test_cashiers_cannot_manage_staff()
    {
        $cashier = User::factory()->create(['role' => 'kasir']);
        $this->actingAs($cashier);

        $response = $this->get(route('staf.index'));
        $response->assertStatus(403);

        $responsePost = $this->post(route('staf.store'), [
            'name' => 'Staf Baru 2',
            'email' => 'staf2@toko.com',
            'password' => 'password123',
        ]);
        $responsePost->assertStatus(403);
    }

    public function test_owner_can_list_staff()
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $this->actingAs($owner);

        // Create some cashier staff
        $cashier1 = User::factory()->create(['role' => 'kasir', 'name' => 'Andi']);
        $cashier2 = User::factory()->create(['role' => 'kasir', 'name' => 'Budi']);
        // Create another owner (should not be in staff list)
        $owner2 = User::factory()->create(['role' => 'owner', 'name' => 'Candra']);

        $response = $this->get(route('staf.index'));
        $response->assertOk();

        // Check if cashiers are sent to the view, but not the other owner
        $response->assertInertia(fn ($page) => $page
            ->component('staf')
            ->has('staff', 2)
            ->where('staff.0.name', 'Budi') // Sorted by desc id
            ->where('staff.1.name', 'Andi')
        );
    }

    public function test_owner_can_create_cashier()
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $this->actingAs($owner);

        $response = $this->post(route('staf.store'), [
            'name' => 'Kasir Baru',
            'email' => 'kasirbaru@toko.com',
            'password' => 'secretpassword123',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'name' => 'Kasir Baru',
            'email' => 'kasirbaru@toko.com',
            'role' => 'kasir',
        ]);

        // Verify password hashing
        $newUser = User::where('email', 'kasirbaru@toko.com')->first();
        $this->assertTrue(Hash::check('secretpassword123', $newUser->password));
    }

    public function test_owner_can_update_cashier()
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $this->actingAs($owner);

        $cashier = User::factory()->create([
            'name' => 'Kasir Lama',
            'email' => 'kasirlama@toko.com',
            'role' => 'kasir',
            'password' => Hash::make('oldpassword'),
        ]);

        // Update name and email without password
        $response = $this->put(route('staf.update', $cashier->id), [
            'name' => 'Kasir Edit',
            'email' => 'kasiredit@toko.com',
        ]);

        $response->assertRedirect();
        $cashier->refresh();
        $this->assertEquals('Kasir Edit', $cashier->name);
        $this->assertEquals('kasiredit@toko.com', $cashier->email);
        $this->assertTrue(Hash::check('oldpassword', $cashier->password));

        // Update name, email AND password
        $response2 = $this->put(route('staf.update', $cashier->id), [
            'name' => 'Kasir Edit 2',
            'email' => 'kasiredit2@toko.com',
            'password' => 'newpassword123',
        ]);

        $response2->assertRedirect();
        $cashier->refresh();
        $this->assertEquals('Kasir Edit 2', $cashier->name);
        $this->assertEquals('kasiredit2@toko.com', $cashier->email);
        $this->assertTrue(Hash::check('newpassword123', $cashier->password));
    }

    public function test_owner_can_delete_cashier()
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $this->actingAs($owner);

        $cashier = User::factory()->create([
            'role' => 'kasir',
        ]);

        $response = $this->delete(route('staf.destroy', $cashier->id));
        $response->assertRedirect();
        $this->assertDatabaseMissing('users', ['id' => $cashier->id]);
    }

    public function test_owner_cannot_delete_self()
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $this->actingAs($owner);

        $response = $this->delete(route('staf.destroy', $owner->id));
        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['id' => $owner->id]);
    }
}
