import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { fromNano, toNano } from '@ton/core';
import { SendTon } from '../wrappers/SendTon';
import '@ton/test-utils';

describe('SendTon', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let sendTon: SandboxContract<SendTon>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        sendTon = blockchain.openContract(await SendTon.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await sendTon.send(
            deployer.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: sendTon.address,
            deploy: true,
            success: true,
        });

        await sendTon.send(deployer.getSender(), { value: toNano('500') }, null);
    });

    it('should deploy and receive ton', async () => {
        const balance = await sendTon.getBalance();
    });

    it('should withdraw all', async () => {
        const user = await blockchain.treasury('user');
        const balanceBeforeUser = await user.getBalance();

        await sendTon.send(user.getSender(), { value: toNano('1') }, 'withdraw_all');

        const blanceAfterUser = await user.getBalance();

        expect(balanceBeforeUser).toBeGreaterThanOrEqual(blanceAfterUser);

        const balanceBeforeDeployer = await deployer.getBalance();
        await sendTon.send(deployer.getSender(), { value: toNano('1') }, 'withdraw_all');
        const balanceAfterDeployer = await deployer.getBalance();

        expect(balanceAfterDeployer).toBeGreaterThan(balanceBeforeDeployer)
    });
});
