<?php

namespace Tests\Feature;

use App\Models\StoreSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreSettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_or_update_store_settings()
    {
        $response = $this->get(route('store.edit'));
        $response->assertRedirect(route('login'));

        $responsePatch = $this->patch(route('store.update'), [
            'store_name' => 'Toko Baru',
        ]);
        $responsePatch->assertRedirect(route('login'));
    }

    public function test_cashiers_cannot_view_or_update_store_settings()
    {
        $cashier = User::factory()->create(['role' => 'kasir']);
        $this->actingAs($cashier);

        $response = $this->get(route('store.edit'));
        $response->assertStatus(403);

        $responsePatch = $this->patch(route('store.update'), [
            'store_name' => 'Toko Cashier',
        ]);
        $responsePatch->assertStatus(403);
    }

    public function test_owner_can_view_store_settings_edit_page()
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $this->actingAs($owner);

        $response = $this->get(route('store.edit'));
        $response->assertOk();
    }

    public function test_owner_can_create_and_update_store_settings()
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $this->actingAs($owner);

        // First update (which should create the setting)
        $response = $this->patch(route('store.update'), [
            'store_name' => 'Warung Maju',
            'store_address' => 'Jl. Kebon Jeruk No. 5',
            'store_phone' => '08987654321',
            'whatsapp_number' => '628987654321',
            'receipt_footer' => 'Terima Kasih, Datang Kembali!',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('store_settings', [
            'store_name' => 'Warung Maju',
            'store_address' => 'Jl. Kebon Jeruk No. 5',
            'store_phone' => '08987654321',
            'whatsapp_number' => '628987654321',
            'receipt_footer' => 'Terima Kasih, Datang Kembali!',
        ]);

        // Second update (which should update the existing setting)
        $response2 = $this->patch(route('store.update'), [
            'store_name' => 'Warung Makmur',
            'store_address' => 'Jl. Mangga No. 10',
            'store_phone' => '08111222333',
            'whatsapp_number' => '628111222333',
            'receipt_footer' => 'Struk Belanja Resmi',
        ]);

        $response2->assertRedirect();
        $this->assertDatabaseHas('store_settings', [
            'store_name' => 'Warung Makmur',
            'store_address' => 'Jl. Mangga No. 10',
            'store_phone' => '08111222333',
            'whatsapp_number' => '628111222333',
            'receipt_footer' => 'Struk Belanja Resmi',
        ]);
        
        $this->assertEquals(1, StoreSetting::count());
    }
}
