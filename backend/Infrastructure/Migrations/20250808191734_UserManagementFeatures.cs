using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IntranetStarter.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UserManagementFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ActivatedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InvitedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "InvitedById",
                table: "Users",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsProvisioned",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "PendingInvitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    IntendedRole = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    InvitedById = table.Column<Guid>(type: "uuid", nullable: false),
                    InvitedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsUsed = table.Column<bool>(type: "boolean", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PendingInvitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PendingInvitations_Users_InvitedById",
                        column: x => x.InvitedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ActivatedAt", "InvitedAt", "InvitedById", "IsProvisioned" },
                values: new object[] { null, null, null, false });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "ActivatedAt", "InvitedAt", "InvitedById", "IsProvisioned" },
                values: new object[] { null, null, null, false });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "ActivatedAt", "InvitedAt", "InvitedById", "IsProvisioned" },
                values: new object[] { null, null, null, false });

            migrationBuilder.CreateIndex(
                name: "IX_Users_InvitedById",
                table: "Users",
                column: "InvitedById");

            migrationBuilder.CreateIndex(
                name: "IX_PendingInvitations_Email_IsUsed",
                table: "PendingInvitations",
                columns: new[] { "Email", "IsUsed" });

            migrationBuilder.CreateIndex(
                name: "IX_PendingInvitations_InvitedById",
                table: "PendingInvitations",
                column: "InvitedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Users_InvitedById",
                table: "Users",
                column: "InvitedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Users_InvitedById",
                table: "Users");

            migrationBuilder.DropTable(
                name: "PendingInvitations");

            migrationBuilder.DropIndex(
                name: "IX_Users_InvitedById",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ActivatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "InvitedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "InvitedById",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsProvisioned",
                table: "Users");
        }
    }
}
